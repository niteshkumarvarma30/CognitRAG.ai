import sys
import os
from pathlib import Path

# Add project root to path
project_root = str(Path(__file__).parent.parent)
sys.path.append(project_root)

from dotenv import load_dotenv
load_dotenv(os.path.join(project_root, ".env"))

from src.database.supabase_client import supabase_manager
from src.database.neo4j_client import neo4j_manager

def wipe_all():
    print("WARNING: Wiping all data from Supabase and Neo4j...")
    
    # 1. Wipe Supabase (using tenant clients to bypass RLS)
    known_tenants = [
        "619f50ab-df74-4057-9305-05a70fdc2474",
        "3780bb27-250a-4a2c-be4b-9252b8e8ce9a",
        "a7f179d0-83b7-4960-843f-3cac536797f3"
    ]
    try:
        print("Clearing Supabase document_chunks and documents via tenant clients...")
        for t_id in known_tenants:
            db = supabase_manager.get_tenant_client(t_id)
            db.table("document_chunks").delete().eq("tenant_id", t_id).execute()
            db.table("documents").delete().eq("tenant_id", t_id).execute()
        print("[SUCCESS] Supabase cleared.")
    except Exception as e:
        print(f"Error clearing Supabase: {e}")
        
    # 2. Wipe Neo4j
    try:
        print("Clearing Neo4j graph...")
        session = neo4j_manager.get_session()
        session.run("MATCH (n) DETACH DELETE n")
        session.close()
        print("[SUCCESS] Neo4j cleared.")
    except Exception as e:
        print(f"Error clearing Neo4j: {e}")

if __name__ == "__main__":
    wipe_all()
