import os
from dotenv import load_dotenv
load_dotenv()

from neo4j import GraphDatabase

from src.database.supabase_client import supabase_manager
from src.ingestion.parser import parse_pdf, chunk_text
from src.ingestion.graph_worker import process_graph_track_sync

TENANT_A = "11111111-1111-1111-1111-111111111111"
TENANT_B = "22222222-2222-2222-2222-222222222222"
TENANT_C = "33333333-3333-3333-3333-333333333333"

def wipe_neo4j():
    print("Wiping Neo4j Database...")
    uri = os.environ.get("NEO4J_URI", "")
    user = os.environ.get("NEO4J_USERNAME", "neo4j")
    pwd = os.environ.get("NEO4J_PASSWORD", "")
    
    driver = GraphDatabase.driver(uri, auth=(user, pwd))
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
    driver.close()
    print("Neo4j database cleared.")

def ingest_graph_only(tenant_id, filepath):
    print(f"Running Graph Extraction + Coreference Resolution for {filepath}...")
    filename = os.path.basename(filepath)
    
    with open(filepath, "rb") as f:
        pdf_bytes = f.read()
        
    text = parse_pdf(pdf_bytes)
    chunks = chunk_text(text)
    
    # We use a dummy document ID since we aren't recreating the Supabase document record
    dummy_doc_id = "00000000-0000-0000-0000-000000000000"
    
    process_graph_track_sync(tenant_id, dummy_doc_id, chunks)
    print(f"Finished graph extraction for {filename}")

if __name__ == "__main__":
    wipe_neo4j()
    
    print("\n--- Starting Multi-Tenant Graph-Only Ingestion ---")
    ingest_graph_only(TENANT_A, "tenant_a_postgres_sample.pdf")
    ingest_graph_only(TENANT_B, "tenant_b_intel_sample.pdf")
    ingest_graph_only(TENANT_C, "tenant_c_aws_sample.pdf")
    
    print("\nGraph re-ingestion complete!")
