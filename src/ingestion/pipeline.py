import os
import hashlib
import time
import concurrent.futures
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel, Field

from src.database.neo4j_client import neo4j_manager
from src.database.supabase_client import supabase_manager
from typing import List

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

import litellm
import instructor

# Configure LiteLLM for Bedrock Instructor
litellm.drop_params = True
bedrock_model = "bedrock/meta.llama3-70b-instruct-v1:0"

# Use LiteLLM with JSON mode for Instructor to support AWS Bedrock natively
bedrock_instructor = instructor.from_litellm(litellm.completion, mode=instructor.Mode.JSON)

def resolve_coreferences(chunk: str) -> str:
    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = litellm.completion(
                model=bedrock_model,
                messages=[
                    {
                        "role": "user",
                        "content": f"You are a precise technical editor. Rewrite the following text by replacing all pronouns (it, they, this, these, etc.) and vague references with the exact proper nouns or entities they refer to based on the context. Do not summarize or change the meaning. Return ONLY the rewritten text.\n\nText:\n{chunk}"
                    }
                ],
                temperature=0.0
            )
            time.sleep(3) # Pace for AWS Bedrock RPM limit
            return response.choices[0].message.content
        except Exception as e:
            print(f"Coreference resolution failed (attempt {attempt+1}): {e}")
            time.sleep(20)
    return chunk

def extract_graph_from_chunk(chunk: str) -> GraphExtraction:
    max_retries = 5
    for attempt in range(max_retries):
        try:
            result = bedrock_instructor.chat.completions.create(
                model=bedrock_model,
                response_model=GraphExtraction,
                messages=[
                    {
                        "role": "user", 
                        "content": f"You are a highly precise technical knowledge graph extractor. Extract core entities and their relationships from the provided text.\n\nText:\n{chunk}"
                    }
                ],
                temperature=0.1
            )
            time.sleep(3) # Pace for AWS Bedrock RPM limit
            return result
        except Exception as e:
            print(f"Graph extraction failed (attempt {attempt+1}): {e}")
            time.sleep(20)
    return None

def process_parent_chunk(parent_text: str, tenant_id: str, document_id: str):
    parent_id = hashlib.sha256(parent_text.encode()).hexdigest()
    
    db = supabase_manager.get_admin_client()
    check = db.table("documents").select("id").eq("id", document_id).execute()
    if not check.data:
        print(f"    -> Document {document_id} was deleted. Aborting.")
        return

    print("    -> Resolving Coreferences...")
    resolved_chunk = resolve_coreferences(parent_text)

    print("    -> Extracting Graph Entities...")
    entities = []
    relationships = []
    graph_data = extract_graph_from_chunk(resolved_chunk)
    if graph_data:
        entities = graph_data.entities
        relationships = graph_data.relationships

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
                
    entity_names = [ent.name for ent in entities]
    relationship_types = [rel.relation_type for rel in relationships]
    
    child_splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    child_texts = child_splitter.split_text(resolved_chunk)

    child_texts = [text.strip() for text in child_texts if text.strip()]
    if not child_texts:
        return

    print(f"    -> Embedding {len(child_texts)} child chunks...")
    embeddings_data_list = []
    
    for i in range(0, len(child_texts), 50):
        batch = child_texts[i:i+50]
        try:
            resp = litellm.embedding(
                model="bedrock/amazon.titan-embed-text-v2:0",
                input=batch
            )
            embeddings_data_list.extend([d.embedding for d in resp.data])
        except Exception as e:
            print(f"    -> Error in Titan embedding batch: {e}")
            raise e
    
    records = []
    for i, child_text in enumerate(child_texts):
        records.append({
            "document_id": document_id,
            "tenant_id": tenant_id,
            "content": parent_text,
            "embedding": embeddings_data_list[i],
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
    with neo4j_manager.driver.session() as session:
        session.run("MERGE (t:Tenant {id: $tenant_id})", tenant_id=tenant_id)
        session.run("""
            MERGE (d:Document {id: $doc_id})
            ON CREATE SET d.tenantId = $tenant_id
            WITH d
            MATCH (t:Tenant {id: $tenant_id})
            MERGE (d)-[:BELONGS_TO]->(t)
        """, doc_id=document_id, tenant_id=tenant_id)

    print(f"Starting Bedrock pipeline for {len(parent_chunks)} parent chunks...")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        futures = {executor.submit(process_parent_chunk, chunk, tenant_id, document_id): chunk for chunk in parent_chunks}
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"Failed to process a parent chunk: {e}")
