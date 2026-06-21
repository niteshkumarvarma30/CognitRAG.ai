import os
import instructor
import concurrent.futures
import hashlib
import json
import time
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List
from src.database.neo4j_client import neo4j_manager
from src.database.supabase_client import supabase_manager

# Clients
sarvam_client = OpenAI(
    api_key=os.environ.get("SARVAM_API_KEY", ""),
    base_url="https://api.sarvam.ai/v1"
)

jina_client = OpenAI(
    api_key=os.environ.get("JINA_API_KEY", ""), 
    base_url="https://api.jina.ai/v1"
)

github_client = OpenAI(
    api_key=os.environ.get("GITHUB_TOKEN", ""),
    base_url="https://models.inference.ai.azure.com"
)

groq_client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY", ""),
    base_url="https://api.groq.com/openai/v1"
)

gemini_client = OpenAI(
    api_key=os.environ.get("GEMINI_API_KEY", ""),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

sambanova_client = OpenAI(
    api_key=os.environ.get("SAMBANOVA_API_KEY", ""),
    base_url="https://api.sambanova.ai/v1"
)

instructor_client = instructor.from_openai(groq_client, mode=instructor.Mode.JSON)
sarvam_instructor = instructor.from_openai(sarvam_client, mode=instructor.Mode.JSON)
gemini_instructor = instructor.from_openai(gemini_client, mode=instructor.Mode.JSON)
sambanova_instructor = instructor.from_openai(sambanova_client, mode=instructor.Mode.JSON)
github_instructor = instructor.from_openai(github_client, mode=instructor.Mode.JSON)

# Schemas
class Entity(BaseModel):
    name: str = Field(description="Name of the entity in title case")
    type: str = Field(description="Type of the entity (e.g., Feature, Error, Register, Component, Concept)")

class Relationship(BaseModel):
    source_entity: str = Field(description="Name of the source entity")
    target_entity: str = Field(description="Name of the target entity")
    relation_type: str = Field(description="Type of relationship, ALL_CAPS (e.g., RELATES_TO, CAUSES, DEPENDS_ON)")

class GraphExtraction(BaseModel):
    entities: List[Entity]
    relationships: List[Relationship]

def resolve_coreferences(chunk: str) -> str:
    """Uses LLM to replace pronouns with their actual entities before extraction."""
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise technical editor. Rewrite the following text by replacing all pronouns (it, they, this, these, etc.) and vague references with the exact proper nouns or entities they refer to based on the context. Do not summarize or change the meaning. Return ONLY the rewritten text."
                },
                {
                    "role": "user",
                    "content": f"Text:\n{chunk}"
                }
            ],
            temperature=0.0
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Coreference resolution failed: {e}")
        return chunk # Fallback to original text if rate limited

def extract_graph_from_chunk(chunk: str) -> GraphExtraction:
    """Uses Instructor to strictly enforce the Neo4j schema structure."""
    time.sleep(4.5)  # Throttle to avoid SambaNova 15 RPM limit
    return github_instructor.chat.completions.create(
        model="gpt-4o-mini",
        response_model=GraphExtraction,
        messages=[
            {
                "role": "system", 
                "content": "You are a highly precise technical knowledge graph extractor. Extract core entities and their relationships from the provided text."
            },
            {
                "role": "user", 
                "content": f"Text:\n{chunk}"
            }
        ],
        temperature=0.1
    )

def process_parent_chunk(parent_text: str, tenant_id: str, document_id: str):
    """Processes a single parent chunk linearly through Coreference, Graph, and Vector stages."""
    parent_id = hashlib.sha256(parent_text.encode()).hexdigest()
    
    # 1. Coreference Resolution
    print("    -> Resolving Coreferences...")
    resolved_chunk = resolve_coreferences(parent_text)
    
    # Check for cancellation: If the user deleted the document mid-ingestion, abort.
    db = supabase_manager.get_tenant_client(tenant_id)
    check = db.table("documents").select("id").eq("id", document_id).execute()
    if not check.data:
        print(f"    -> Document {document_id} was deleted. Aborting background thread.")
        return

    # 2. Entity and Relationship Extraction
    print("    -> Extracting Graph Entities...")
    entities = []
    relationships = []
    try:
        graph_data = extract_graph_from_chunk(resolved_chunk)
        if graph_data:
            entities = graph_data.entities
            relationships = graph_data.relationships
    except Exception as e:
        print(f"Failed to extract graph for chunk: {e}")

    # 3. Neo4j Graph Construction
    if entities:
        with neo4j_manager.driver.session() as session:
            for ent in entities:
                session.run("""
                    MERGE (e:Entity {name: $name, tenantId: $tenant_id})
                    ON CREATE SET e.type = $type
                    WITH e
                    MATCH (t:Tenant {id: $tenant_id})
                    MERGE (e)-[:BELONGS_TO]->(t)
                    WITH e
                    MATCH (d:Document {id: $doc_id})
                    MERGE (e)-[:FOUND_IN]->(d)
                """, name=ent.name, type=ent.type, tenant_id=tenant_id, doc_id=document_id)
            
            for rel in relationships:
                session.run("""
                    MATCH (s:Entity {name: $source, tenantId: $tenant_id})
                    MATCH (t:Entity {name: $target, tenantId: $tenant_id})
                    MERGE (s)-[r:RELATION {type: $rel_type}]->(t)
                """, source=rel.source_entity, target=rel.target_entity, rel_type=rel.relation_type, tenant_id=tenant_id)
                
    # 4. Graph Metrics
    entity_names = [ent.name for ent in entities]
    relationship_types = [rel.relation_type for rel in relationships]
    
    entity_count = len(entities)
    relationship_count = len(relationships)
    graph_score = relationship_count / max(entity_count, 1)
    
    # 5. Child Chunking (on the resolved text!)
    child_splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    child_texts = child_splitter.split_text(resolved_chunk)

    if not child_texts:
        return

    # 6. Embeddings (Embed the Child chunks!)
    print(f"    -> Embedding {len(child_texts)} child chunks...")
    embeddings_data = jina_client.embeddings.create(
        input=child_texts,
        model="jina-embeddings-v4",
        dimensions=1536
    )
    
    # 7. Supabase Storage (Metadata Enrichment)
    db = supabase_manager.get_tenant_client(tenant_id)
    records = []
    
    for i, child_text in enumerate(child_texts):
        records.append({
            "document_id": document_id,
            "tenant_id": tenant_id,
            "content": parent_text, # Store the broad parent text
            "embedding": embeddings_data.data[i].embedding, # Embed the precise child text
            "parent_id": parent_id,
            "entities": entity_names,
            "relationship_types": list(set(relationship_types))
        })
        
    try:
        db.table("document_chunks").insert(records).execute()
        print(f"    -> Inserted {len(records)} enriched chunks into Supabase")
    except Exception as e:
        print(f"    -> FAILED to insert chunks into Supabase: {e}")

def run_ingestion_pipeline(tenant_id: str, document_id: str, parent_chunks: list[str]):
    """Orchestrates the unified multi-threaded ingestion pipeline."""
    
    # Ensure Tenant and Document exist in Neo4j first
    with neo4j_manager.driver.session() as session:
        session.run("MERGE (t:Tenant {id: $tenant_id})", tenant_id=tenant_id)
        session.run("""
            MERGE (d:Document {id: $doc_id})
            ON CREATE SET d.tenantId = $tenant_id
            WITH d
            MATCH (t:Tenant {id: $tenant_id})
            MERGE (d)-[:BELONGS_TO]->(t)
        """, doc_id=document_id, tenant_id=tenant_id)

    print(f"Starting unified multi-threaded pipeline for {len(parent_chunks)} parent chunks...")
    
    # Process all parent chunks sequentially (max_workers=1) to respect RPM limit
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        futures = [
            executor.submit(process_parent_chunk, parent_text, tenant_id, document_id) 
            for parent_text in parent_chunks
        ]
        concurrent.futures.wait(futures)
