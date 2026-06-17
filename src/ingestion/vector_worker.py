import os
import openai
from src.database.supabase_client import supabase_manager

def process_vector_track_sync(tenant_id: str, document_id: str, chunks: list[tuple[str, str]]):
    """Generates embeddings for child chunks and bulk inserts them into Supabase with parent content."""
    oai_client = openai.OpenAI(
        api_key=os.environ.get("JINA_API_KEY", ""), 
        base_url="https://api.jina.ai/v1"
    )
    
    # Request embeddings from Jina API for the small child chunks
    child_texts = [child for _, child in chunks]
    embeddings_data = oai_client.embeddings.create(
        input=child_texts,
        model="jina-embeddings-v4",
        dimensions=1536 # Matryoshka dimension constraint truncates 2048 to 1536
    )
    
    # Get the securely isolated tenant client
    db = supabase_manager.get_tenant_client(tenant_id)
    
    records = []
    for i, (parent, child) in enumerate(chunks):
        records.append({
            "document_id": document_id,
            "tenant_id": tenant_id,
            "content": parent, # The genius part: we store the LARGE parent block!
            "embedding": embeddings_data.data[i].embedding # But embed the SMALL child chunk!
        })
        
    print(f"  -> Prepared {len(records)} records for document_chunks insertion")
    # Bulk insert into pgvector
    try:
        res = db.table("document_chunks").insert(records).execute()
        print(f"  -> Inserted {len(res.data)} records successfully")
    except Exception as e:
        print(f"  -> FAILED to insert into document_chunks: {e}")
        raise e
