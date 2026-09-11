import requests
from typing import Dict, Any, List
from src.database.supabase_client import supabase_manager
from src.api.routes import background_ingestion_pipeline, get_tenant_uuid

class GDriveCrawler:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.uuid_tenant = get_tenant_uuid(tenant_id)
        self.admin_db = supabase_manager.get_admin_client()
        self.token = self._get_gdrive_token()
        self.headers = {
            "Authorization": f"Bearer {self.token}"
        }

    def _get_gdrive_token(self) -> str:
        resp = self.admin_db.table("tenant_integrations")\
            .select("access_token")\
            .eq("tenant_id", self.uuid_tenant)\
            .eq("integration_type", "google_drive")\
            .execute()
        if not resp.data:
            legacy_uuid = get_tenant_uuid("ws_1")
            resp = self.admin_db.table("tenant_integrations")\
                .select("access_token")\
                .eq("tenant_id", legacy_uuid)\
                .eq("integration_type", "google_drive")\
                .execute()
        if not resp.data:
            raise ValueError(f"No Google Drive integration found for tenant {self.tenant_id}")
        return resp.data[0]["access_token"]

    def list_files(self, query: str = None, page_size: int = 50) -> List[Dict]:
        """Lists files from Google Drive matching the query."""
        # Default query: Only fetch Google Docs and plain text files
        if not query:
            query = "mimeType='application/vnd.google-apps.document' or mimeType='text/plain' or mimeType='text/markdown'"
            
        url = "https://www.googleapis.com/drive/v3/files"
        params = {
            "q": query,
            "pageSize": page_size,
            "fields": "nextPageToken, files(id, name, mimeType, modifiedTime)"
        }
        
        resp = requests.get(url, headers=self.headers, params=params)
        if resp.status_code != 200:
            print(f"GDrive API error: {resp.text}")
            return []
            
        return resp.json().get("files", [])

    def download_file(self, file_id: str, mime_type: str) -> bytes:
        """Downloads a standard file or exports a Google Doc to plain text."""
        if mime_type == "application/vnd.google-apps.document":
            # Export Google Docs as plain text
            url = f"https://www.googleapis.com/drive/v3/files/{file_id}/export"
            params = {"mimeType": "text/plain"}
        else:
            # Download binary/text file
            url = f"https://www.googleapis.com/drive/v3/files/{file_id}"
            params = {"alt": "media"}
            
        resp = requests.get(url, headers=self.headers, params=params)
        if resp.status_code != 200:
            print(f"Failed to download GDrive file {file_id}: {resp.text}")
            return b""
            
        return resp.content

    def crawl_and_ingest(self, background_tasks, query: str = None) -> int:
        """Crawls Google Drive files, exports them to text, and queues them for semantic ingestion."""
        files = self.list_files(query=query)
        queued = 0
        
        db = supabase_manager.get_tenant_client(self.uuid_tenant)
        
        for f in files:
            file_id = f["id"]
            file_name = f["name"]
            mime_type = f["mimeType"]
            
            # Download or export content
            file_bytes = self.download_file(file_id, mime_type)
            if not file_bytes:
                continue
                
            # If it's a Google Doc, format it with a markdown header
            if mime_type == "application/vnd.google-apps.document":
                content = f"# {file_name}\n\n" + file_bytes.decode('utf-8', errors='ignore')
                file_bytes = content.encode('utf-8')
                file_name = f"{file_name}.md"
                
            filename_path = f"gdrive/{file_name}"
            
            db_resp = db.table("documents").insert({
                "tenant_id": self.uuid_tenant,
                "filename": filename_path,
                "status": "pending"
            }).execute()
            
            document_id = db_resp.data[0]['id']
            
            background_tasks.add_task(
                background_ingestion_pipeline, 
                self.uuid_tenant, 
                document_id, 
                file_bytes,
                filename_path
            )
            queued += 1
            
        return queued
