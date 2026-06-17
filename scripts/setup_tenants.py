import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client
from neo4j import GraphDatabase

from src.database.supabase_client import supabase_manager
from src.api.routes import background_ingestion_pipeline

load_dotenv()

# Tenant IDs
TENANT_A = "11111111-1111-1111-1111-111111111111"
TENANT_B = "22222222-2222-2222-2222-222222222222"
TENANT_C = "33333333-3333-3333-3333-333333333333"

def wipe_neo4j():
    print("Wiping Neo4j Database...")
    uri = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
    user = os.environ.get("NEO4J_USERNAME", "neo4j")
    pwd = os.environ.get("NEO4J_PASSWORD", "password")
    
    driver = GraphDatabase.driver(uri, auth=(user, pwd))
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
    driver.close()
    print("Neo4j database cleared.")

import jwt

def get_service_client():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    jwt_secret = os.environ.get("SUPABASE_JWT_SECRET")
    
    payload = {
        "role": "service_role",
    }
    encoded_jwt = jwt.encode(payload, jwt_secret, algorithm="HS256")
    
    client = create_client(url, key)
    client.options.headers.update({
        "Authorization": f"Bearer {encoded_jwt}"
    })
    return client

def wipe_supabase():
    print("Wiping Supabase Database...")
    supabase = get_service_client()
    
    # Tables that have 'id'
    id_tables = ["transactions", "document_chunks", "documents", "tenants"]
    for table in id_tables:
        try:
            supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"Cleared table {table}")
        except Exception as e:
            print(f"Error clearing table {table}: {e}")
            
    # Tables that have 'tenant_id' but maybe no 'id'
    tenant_tables = ["episodic_memory", "preference_memory"]
    for table in tenant_tables:
        try:
            supabase.table(table).delete().neq("tenant_id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"Cleared table {table}")
        except Exception as e:
            print(f"Error clearing table {table}: {e}")

def ingest_tenant(tenant_id, name, filepath):
    supabase = get_service_client()
    try:
        supabase.table("tenants").insert({"id": tenant_id, "name": name}).execute()
    except Exception as e:
        print(f"Tenant {name} already exists or error: {e}")
        
    print(f"Ingesting {filepath} into Tenant {tenant_id}...")
    filename = os.path.basename(filepath)
    
    with open(filepath, "rb") as f:
        pdf_bytes = f.read()
        
    db = supabase_manager.get_tenant_client(tenant_id)
    response = db.table("documents").insert({
        "tenant_id": tenant_id,
        "filename": filename,
        "status": "pending"
    }).execute()
    
    document_id = response.data[0]['id']
    background_ingestion_pipeline(tenant_id, document_id, pdf_bytes)
    print(f"Finished ingesting {filename}")

if __name__ == "__main__":
    wipe_neo4j()
    wipe_supabase()
    
    print("\n--- Starting Multi-Tenant Ingestion ---")
    ingest_tenant(TENANT_A, "Tenant A: PostgreSQL Foundation", "tenant_a_postgres_sample.pdf")
    ingest_tenant(TENANT_B, "Tenant B: Intel Architecture", "tenant_b_intel_sample.pdf")
    ingest_tenant(TENANT_C, "Tenant C: AWS Cloud Services", "tenant_c_aws_sample.pdf")
    
    print("\nAll 3 Tenants successfully ingested and initialized!")
