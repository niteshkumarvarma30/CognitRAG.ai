"""
CognitRAG v2 — Ingestion Pipeline
Language-aware ingestion with:
- Confidence-tiered Neo4j graph edges (§3.3)
- Claim-level chunk source reference (§3.2)
- Hinglish-aware embedding routing
"""
import os
import hashlib
import time
import uuid
import concurrent.futures
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel, Field
from typing import List, Optional

from src.database.neo4j_client import neo4j_manager
from src.database.supabase_client import supabase_manager
from src.utils.sanitizer import sanitize_text
from src.ingestion.cross_linker import link_cross_system_entities
from src.ingestion.language_detector import detect_language, tag_chunk_language
from src.ingestion.normalizer import NormalizedDoc

from src.services.vertex_client import vertex_client
from src.services.sarvam_client import sarvam_client


# ============================================================
# PYDANTIC MODELS
# ============================================================
class Entity(BaseModel):
    name: str = Field(description="Name of the entity in title case")
    type: str = Field(description="Type of the entity (Feature, Error, Component, Person, Decision, etc.)")

class Relationship(BaseModel):
    source_entity: str = Field(description="Name of the source entity")
    target_entity: str = Field(description="Name of the target entity")
    relation_type: str = Field(description="Relationship type in ALL_CAPS (RELATES_TO, DECIDED_BY, DEPENDS_ON, etc.)")
    confidence: float = Field(default=0.8, description="Confidence score 0.0-1.0 for this extraction")

class GraphExtraction(BaseModel):
    entities: List[Entity]
    relationships: List[Relationship]


# ============================================================
# EMBEDDING ROUTER  — Google Vertex AI + Sarvam Hinglish
# ============================================================
def get_embedding_for_language(text: str, language_tag: str) -> list[float]:
    """
    Route embedding to Google Cloud Vertex AI text-embedding-004 (768 dimensions).
    Indian language / Hinglish chunks are translated to English via Sarvam mayura:v1
    for high semantic accuracy while preserving original content.
    """
    try:
        norm_text = text
        if sarvam_client.is_available() and language_tag in ("hi-latn", "mixed", "hi"):
            translated = sarvam_client.translate(text)
            if translated and translated != text:
                norm_text = translated
        return vertex_client.get_embedding(norm_text)
    except Exception as e:
        print(f"Vertex embedding failed: {e}")
        return [0.0] * 768


def get_embeddings_batch(texts: list[str], language_tag: str) -> list[list[float]]:
    """Batch 768-dim embeddings with Vertex AI text-embedding-004."""
    if not texts:
        return []
    try:
        normalized_texts = []
        for t in texts:
            norm_t = t
            if sarvam_client.is_available() and language_tag in ("hi-latn", "mixed", "hi"):
                trans = sarvam_client.translate(t)
                if trans and trans != t:
                    norm_t = trans
            normalized_texts.append(norm_t)
        return vertex_client.get_embeddings(normalized_texts)
    except Exception as e:
        print(f"Vertex batch embedding failed: {e}")
        return [[0.0] * 768 for _ in texts]


# ============================================================
# COREFERENCE RESOLUTION (Vertex AI gemini-2.5-flash)
# ============================================================
def resolve_coreferences(chunk: str, language_tag: str = "en") -> str:
    """
    Resolve pronouns before graph extraction using Vertex AI gemini-2.5-flash.
    """
    if language_tag in ("hi-latn", "mixed"):
        print("    -> Normalizing Hinglish phrasing before graph extraction...")
        if sarvam_client.is_available():
            chunk = sarvam_client.translate(chunk)

    try:
        rewritten = vertex_client.generate(
            prompt="Rewrite the following text by replacing all pronouns (it, they, this, these, etc.) with the exact proper nouns they refer to. Do not summarize or change meaning. Return ONLY the rewritten text.\n\nText:\n" + chunk,
            temperature=0.0,
            max_output_tokens=2048
        )
        if rewritten and len(rewritten.strip()) >= len(chunk) * 0.6:
            return rewritten.strip()
        return chunk
    except Exception as e:
        print(f"Coreference resolution failed: {e}")
        return chunk


# ============================================================
# GRAPH EXTRACTION with confidence scoring (Vertex AI)
# ============================================================
def extract_graph_from_chunk(chunk: str, language_tag: str = "en") -> Optional[GraphExtraction]:
    """
    Extract entities and relationships from text using gemini-2.5-flash.
    Each relationship includes a confidence score 0.0-1.0.
    """
    try:
        system_instruction = (
            "Extract discrete entities and relationships from this text. "
            "For each relationship, provide a confidence score between 0.0 and 1.0 "
            "based on how explicitly the relationship is stated. Output valid JSON matching the schema."
        )
        result = vertex_client.generate_structured(
            prompt="Text to analyze:\n" + chunk,
            response_model=GraphExtraction,
            system_instruction=system_instruction,
            temperature=0.0
        )
        return result
    except Exception as e:
        print(f"Vertex graph extraction failed: {e}")
        return None


# ============================================================
# WRITE GRAPH EDGES with derivation + confidence + source_chunk_id
# ============================================================
def write_graph_edges(entities: List[Entity], relationships: List[Relationship],
                      tenant_id: str, document_id: str, source_chunk_id: str,
                      language_tag: str = "en", derivation: str = "extracted"):
    """
    Write entities and relationships to Neo4j.
    CRITICAL: Every relationship carries derivation, confidence, source_chunk_id.
    This is the §3.3 differentiator — visible confidence tiers in the UI.
    """
    is_eval = "eval" in str(tenant_id).lower()
    lbl = "EvalEntity" if is_eval else "Entity"
    doc_lbl = "EvalDocument" if is_eval else "Document"
    tenant_lbl = "EvalTenant" if is_eval else "Tenant"

    try:
        if neo4j_manager and neo4j_manager.driver:
            with neo4j_manager.driver.session() as session:
                for ent in entities:
                    session.run(f"""
                        MERGE (e:{lbl} {{name: $name, tenantId: $tenant_id}})
                        ON CREATE SET e.type = $type, e.languageTag = $lang
                        WITH e
                        MATCH (t:{tenant_lbl} {{id: $tenant_id}})
                        MERGE (e)-[:BELONGS_TO]->(t)
                        WITH e
                        MATCH (d:{doc_lbl} {{id: $doc_id}})
                        MERGE (e)-[:FOUND_IN]->(d)
                    """, name=ent.name, type=ent.type, tenant_id=tenant_id,
                        doc_id=document_id, lang=language_tag)

                for rel in relationships:
                    session.run(f"""
                        MATCH (s:{lbl} {{name: $source, tenantId: $tenant_id}})
                        MATCH (t:{lbl} {{name: $target, tenantId: $tenant_id}})
                        MERGE (s)-[r:RELATION {{type: $rel_type, source_chunk_id: $chunk_id}}]->(t)
                        ON CREATE SET
                            r.derivation = $derivation,
                            r.confidence = $confidence,
                            r.language_tag = $lang_tag
                        ON MATCH SET
                            r.confidence = CASE WHEN r.confidence < $confidence
                                                THEN $confidence ELSE r.confidence END
                    """,
                        source=rel.source_entity,
                        target=rel.target_entity,
                        rel_type=rel.relation_type,
                        chunk_id=source_chunk_id,
                        derivation=derivation,
                        confidence=rel.confidence,
                        lang_tag=language_tag,
                        tenant_id=tenant_id
                    )
    except Exception as neo_err:
        print(f"    -> Neo4j graph write skipped: {neo_err}")



# ============================================================
# MAIN CHUNK PROCESSOR
# ============================================================
def process_parent_chunk(parent_text: str, tenant_id: str, document_id: str,
                         doc_language_tag: str = "en",
                         source_type: str = "manual",
                         raw_ref_url: str = None,
                         author: str = "Unknown",
                         allowed_entities: list = None):
    if allowed_entities is None:
        allowed_entities = ["public"]

    # Sanitize PII/secrets
    parent_text = sanitize_text(parent_text)
    parent_id = hashlib.sha256(parent_text.encode()).hexdigest()

    # Check document still exists
    db = supabase_manager.get_admin_client()
    check = db.table("documents").select("id").eq("id", document_id).execute()
    if not check.data:
        print(f"    -> Document {document_id} was deleted. Aborting.")
        return

    # Detect language of this specific chunk
    chunk_language = detect_language(parent_text)
    if doc_language_tag in ("hi-latn", "mixed") and chunk_language == "en":
        chunk_language = "mixed"  # parent context overrides

    # Coreference resolution (English only for now)
    print(f"    -> Resolving coreferences (lang: {chunk_language})...")
    resolved_chunk = resolve_coreferences(parent_text, chunk_language)

    # Graph extraction
    print("    -> Extracting graph entities...")
    entities, relationships = [], []
    graph_data = extract_graph_from_chunk(resolved_chunk, chunk_language)
    if graph_data:
        entities = graph_data.entities
        relationships = graph_data.relationships

    # Child chunking with block_id tracking
    child_splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", "।", " ", ""]
    )
    child_texts = child_splitter.split_text(resolved_chunk)
    child_texts = [t.strip() for t in child_texts if t.strip()]
    if not child_texts:
        return

    print(f"    -> Embedding {len(child_texts)} child chunks (lang: {chunk_language})...")

    # Batch embed with language routing
    all_embeddings = get_embeddings_batch(child_texts, chunk_language)

    entity_names = [e.name for e in entities]
    relationship_types = [r.relation_type for r in relationships]

    # Build records with full claim-level source reference
    records = []
    char_offset = 0
    for i, child_text in enumerate(child_texts):
        chunk_id = str(uuid.uuid4())
        start_char = resolved_chunk.find(child_text, char_offset)
        if start_char == -1:
            start_char = char_offset
        end_char = start_char + len(child_text)
        char_offset = end_char

        # Write graph edges for first chunk (representative)
        if i == 0 and entities:
            write_graph_edges(
                entities, relationships, tenant_id, document_id,
                source_chunk_id=chunk_id,
                language_tag=chunk_language,
                derivation="extracted"
            )

        records.append({
            "id": chunk_id,
            "document_id": document_id,
            "tenant_id": tenant_id,
            "parent_id": parent_id,
            "block_id": f"{parent_id}:{i}",
            "start_char": start_char,
            "end_char": end_char,
            "content": child_text,
            "language_tag": tag_chunk_language(child_text, chunk_language),
            "source_type": source_type,
            "raw_ref_url": raw_ref_url,
            "author": author,
            "embedding_768": all_embeddings[i],
            "entities": entity_names,
            "relationship_types": list(set(relationship_types)),
            "allowed_entities": allowed_entities
        })

    # Cross-system entity linking
    cross_link_result = link_cross_system_entities(resolved_chunk, tenant_id, document_id)
    if cross_link_result.get("links_created", 0) > 0:
        print(f"    -> Cross-linked {cross_link_result['links_created']} entities")

    valid_cols = {'id', 'document_id', 'tenant_id', 'parent_id', 'content', 'embedding_768', 'entities', 'graph_score', 'relationship_types', 'allowed_entities', 'source_type', 'raw_ref_url', 'author'}
    safe_records = []
    for r in records:
        safe_r = {k: v for k, v in r.items() if k in valid_cols}
        safe_records.append(safe_r)

    is_eval = "eval" in str(tenant_id).lower()
    tbl = "eval_document_chunks" if is_eval else "document_chunks"
    try:
        db.table(tbl).insert(safe_records).execute()
        print(f"    -> Inserted {len(safe_records)} chunks into {tbl} (lang: {chunk_language}, source: {source_type})")
    except Exception as e:
        print(f"    -> FAILED to insert chunks into {tbl}: {e}")


# ============================================================
# PIPELINE ENTRY POINT
# ============================================================
def run_ingestion_pipeline(tenant_id: str, document_id: str,
                           parent_chunks: list[str],
                           doc_language_tag: str = "en",
                           source_type: str = "manual",
                           raw_ref_url: str = None,
                           author: str = "Unknown",
                           allowed_entities: list = None):
    """
    Main ingestion entry point. Accepts NormalizedDoc metadata.
    Runs with max_workers=1 to respect rate limits.
    """
    if allowed_entities is None:
        allowed_entities = ["public"]

    is_eval = "eval" in str(tenant_id).lower()
    tenant_lbl = "EvalTenant" if is_eval else "Tenant"
    doc_lbl = "EvalDocument" if is_eval else "Document"

    # Ensure Tenant + Document nodes exist in Neo4j
    try:
        if neo4j_manager and neo4j_manager.driver:
            with neo4j_manager.driver.session() as session:
                session.run(f"MERGE (t:{tenant_lbl} {{id: $tenant_id}})", tenant_id=tenant_id)
                session.run(f"""
                    MERGE (d:{doc_lbl} {{id: $doc_id}})
                    ON CREATE SET d.tenantId = $tenant_id, d.sourceType = $source_type
                    WITH d
                    MATCH (t:{tenant_lbl} {{id: $tenant_id}})
                    MERGE (d)-[:BELONGS_TO]->(t)
                """, doc_id=document_id, tenant_id=tenant_id, source_type=source_type)
    except Exception as neo_err:
        print(f"    [WARN] Neo4j session setup skipped (instance unreachable/paused): {neo_err}")

    print(f"Starting pipeline: {len(parent_chunks)} chunks | lang: {doc_language_tag} | source: {source_type}")

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        futures = {
            executor.submit(
                process_parent_chunk,
                chunk, tenant_id, document_id,
                doc_language_tag, source_type, raw_ref_url, author, allowed_entities
            ): chunk
            for chunk in parent_chunks
        }
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"Failed to process chunk: {e}")


# ============================================================
# NORMALIZED DOC → PIPELINE  (convenience wrapper)
# ============================================================
def ingest_normalized_doc(doc: NormalizedDoc, parent_chunks: list[str],
                          allowed_entities: list = None):
    """
    Ingest a NormalizedDoc object.
    This is the preferred entry point — all connectors should use this.
    """
    run_ingestion_pipeline(
        tenant_id=doc.tenant_id,
        document_id=doc.doc_id,
        parent_chunks=parent_chunks,
        doc_language_tag=doc.language_tag,
        source_type=doc.source_type,
        raw_ref_url=doc.raw_ref_url,
        author=doc.author,
        allowed_entities=allowed_entities
    )
