import sys
import os
import uuid
from pathlib import Path

# Add project root to path
project_root = str(Path(__file__).parent.parent)
sys.path.append(project_root)

from dotenv import load_dotenv
load_dotenv(os.path.join(project_root, ".env"))

from scripts.setup_tenants import get_service_client
from src.database.neo4j_client import neo4j_manager
from src.ingestion.parser import chunk_text
from src.ingestion.pipeline import run_ingestion_pipeline

# -------------------------------------------------------------------
# DUMMY TENANT IDENTIFIER FOR BENCHMARKING
# We use the tenant ID hardcoded in mini_benchmark_dataset.csv
# -------------------------------------------------------------------
BENCHMARK_TENANT = "44444444-4444-4444-4444-444444444444"
# -------------------------------------------------------------------

def get_or_create_tenant(tenant_id: str):
    """Ensure the tenant exists in Supabase."""
    supabase = get_service_client()
    try:
        supabase.table("tenants").insert({"id": tenant_id, "name": "Microsoft Benchmark Tenant"}).execute()
        print(f"Created Tenant {tenant_id}")
    except Exception as e:
        print(f"Tenant {tenant_id} already exists or error: {e}")

def create_document_record(tenant_id: str, filename: str) -> str:
    """Create a document record in Supabase and return its UUID."""
    supabase = get_service_client()
    doc_id = str(uuid.uuid4())
    try:
        supabase.table("documents").insert({
            "id": doc_id,
            "tenant_id": tenant_id,
            "filename": filename,
            "status": "processing"
        }).execute()
        return doc_id
    except Exception as e:
        print(f"Failed to create document record: {e}")
        return doc_id

def ingest_microsoft_10k():
    print("--- Starting Microsoft 10-K Ingestion ---")
    
    # 1. Setup Tenant
    get_or_create_tenant(BENCHMARK_TENANT)
    
    # 2. Read File
    filepath = os.path.join(project_root, "Microsoft_10K_Full.txt")
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()
    
    # 3. Create Document Record
    doc_id = create_document_record(BENCHMARK_TENANT, "Microsoft_10K_Full.txt")
    print(f"Document ID: {doc_id}")
    
    # 4. Chunk Text
    print("Chunking Text...")
    chunks = chunk_text(text)
    
    # 5. Use Half Data
    half_index = len(chunks) // 2
    print(f"Using exactly half the data: {half_index} out of {len(chunks)} parent chunks.")
    chunks = chunks[:half_index]
    
    # 6. Run Ingestion Pipeline
    print(f"Ingesting into Tenant {BENCHMARK_TENANT}...")
    run_ingestion_pipeline(BENCHMARK_TENANT, doc_id, chunks)
    
    # 6. Mark Completed
    supabase = get_service_client()
    supabase.table("documents").update({"status": "completed"}).eq("id", doc_id).execute()
    print("--- Ingestion Complete! ---")

if __name__ == "__main__":
    ingest_microsoft_10k()
