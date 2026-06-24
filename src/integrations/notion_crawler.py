import os
import requests
import sys
from src.database.supabase_client import supabase_manager
from src.ingestion.parser import chunk_text
from src.ingestion.pipeline import run_ingestion_pipeline

def crawl_notion_tenant(tenant_id: str):
    admin_db = supabase_manager.get_admin_client()
    
    # 1. Fetch access token
    response = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", tenant_id).eq("integration_type", "notion").execute()
    if not response.data:
        print(f"No Notion integration found for tenant {tenant_id}")
        return
        
    access_token = response.data[0]["access_token"]
    
    # 2. Search for all pages
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
    }
    
    print(f"Fetching Notion pages for tenant {tenant_id}...")
    search_payload = {"filter": {"value": "page", "property": "object"}}
    search_res = requests.post("https://api.notion.com/v1/search", headers=headers, json=search_payload)
    if search_res.status_code != 200:
        print(f"Failed to fetch Notion pages: {search_res.text}")
        return
        
    pages = search_res.json().get("results", [])
    print(f"Found {len(pages)} pages.")
    
    db = supabase_manager.get_tenant_client(tenant_id)
    
    for page in pages:
        page_id = page["id"]
        
        # Extract title robustly
        title = "Untitled"
        
        # Notion title objects are annoying to parse because they depend on the database/page structure
        try:
            if "properties" in page:
                for prop_name, prop_data in page["properties"].items():
                    if prop_data.get("type") == "title":
                        title_arr = prop_data.get("title", [])
                        if len(title_arr) > 0:
                            title = title_arr[0].get("plain_text", "Untitled")
                            break
        except Exception as e:
            pass
            
        print(f"Processing page: {title}")
        
        # 3. Insert document record
        doc_res = db.table("documents").insert({
            "tenant_id": tenant_id,
            "filename": f"Notion: {title}",
            "status": "pending"
        }).execute()
        
        if not doc_res.data:
            print(f"Failed to create document record for {title}")
            continue
            
        document_id = doc_res.data[0]["id"]
        
        try:
            # 4. Fetch page blocks
            blocks_res = requests.get(f"https://api.notion.com/v1/blocks/{page_id}/children", headers=headers)
            blocks = blocks_res.json().get("results", [])
            
            # Very basic block parsing (just paragraphs, headings, list items)
            page_text = f"# {title}\n\n"
            for block in blocks:
                block_type = block["type"]
                if block_type in block and "rich_text" in block[block_type]:
                    for rt in block[block_type]["rich_text"]:
                        page_text += rt.get("plain_text", "")
                    page_text += "\n\n"
            
            if len(page_text.strip()) < len(title) + 5: # Just title + markdown
                page_text = f"Empty Notion Page: {title}"
            
            # 5. Run ingestion pipeline
            chunks = chunk_text(page_text)
            print(f"  -> Extracted {len(chunks)} chunks, running pipeline...")
            run_ingestion_pipeline(tenant_id, document_id, chunks)
            
            # 6. Mark completed
            db.table("documents").update({"status": "completed"}).eq("id", document_id).execute()
            print(f"  -> Successfully ingested {title}")
        except Exception as e:
            print(f"Failed to process Notion page {title}: {e}")
            db.table("documents").update({"status": "failed"}).eq("id", document_id).execute()

def crawl_all_tenants():
    admin_db = supabase_manager.get_admin_client()
    print("Fetching all connected Notion integrations...")
    response = admin_db.table("tenant_integrations").select("tenant_id").eq("integration_type", "notion").execute()
    
    if not response.data:
        print("No Notion integrations found in the database.")
        return
        
    for row in response.data:
        tenant_id = row["tenant_id"]
        crawl_notion_tenant(tenant_id)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        crawl_notion_tenant(sys.argv[1])
    else:
        print("No tenant ID provided. Crawling ALL connected Notion integrations...")
        crawl_all_tenants()
