import requests
import hashlib
import hmac
from typing import Dict, Any
from fastapi import HTTPException
from src.database.supabase_client import supabase_manager
from src.api.routes import background_ingestion_pipeline, get_tenant_uuid

class GitHubCrawler:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.uuid_tenant = get_tenant_uuid(tenant_id)
        self.admin_db = supabase_manager.get_admin_client()
        self.token = self._get_github_token()
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }

    def _get_github_token(self) -> str:
        resp = self.admin_db.table("tenant_integrations")\
            .select("access_token")\
            .eq("tenant_id", self.tenant_id)\
            .eq("integration_type", "github")\
            .execute()
        if not resp.data:
            raise ValueError(f"No GitHub integration found for tenant {self.tenant_id}")
        return resp.data[0]["access_token"]

    def fetch_file_content(self, repo_full_name: str, file_path: str, ref: str) -> str:
        """Fetches raw file content from GitHub."""
        url = f"https://api.github.com/repos/{repo_full_name}/contents/{file_path}?ref={ref}"
        resp = requests.get(url, headers=self.headers)
        if resp.status_code != 200:
            return ""
        
        data = resp.json()
        if data.get("encoding") == "base64":
            import base64
            return base64.b64decode(data["content"]).decode("utf-8")
        return ""

    def process_push_event(self, payload: Dict[str, Any], background_tasks) -> int:
        """Processes a push event by fetching added/modified markdown files."""
        repo_full_name = payload["repository"]["full_name"]
        ref = payload["ref"]
        queued = 0
        
        db = supabase_manager.get_tenant_client(self.uuid_tenant)
        
        for commit in payload.get("commits", []):
            files_to_process = commit.get("added", []) + commit.get("modified", [])
            for file_path in files_to_process:
                if not (file_path.endswith(".md") or file_path.endswith(".txt")):
                    continue
                    
                content = self.fetch_file_content(repo_full_name, file_path, ref)
                if not content:
                    continue
                    
                filename = f"github/{repo_full_name}/{file_path}"
                file_bytes = content.encode("utf-8")
                
                db_resp = db.table("documents").insert({
                    "tenant_id": self.uuid_tenant,
                    "filename": filename,
                    "status": "pending"
                }).execute()
                
                document_id = db_resp.data[0]['id']
                background_tasks.add_task(
                    background_ingestion_pipeline, 
                    self.uuid_tenant, 
                    document_id, 
                    file_bytes,
                    filename
                )
                queued += 1
                
        return queued

    def process_pull_request_event(self, payload: Dict[str, Any], background_tasks) -> int:
        """Processes closed/merged PRs, extracting comments and descriptions."""
        action = payload.get("action")
        if action != "closed":
            return 0
            
        pr = payload["pull_request"]
        if not pr.get("merged"):
            return 0 # Only index merged PRs for solid architectural context
            
        repo_full_name = payload["repository"]["full_name"]
        pr_number = pr["number"]
        pr_title = pr["title"]
        pr_body = pr["body"] or "No description provided."
        author = pr["user"]["login"]
        
        # Fetch PR comments
        comments_url = f"https://api.github.com/repos/{repo_full_name}/issues/{pr_number}/comments"
        resp = requests.get(comments_url, headers=self.headers)
        comments = resp.json() if resp.status_code == 200 else []
        
        content_lines = [
            f"# Pull Request: {pr_title} (#{pr_number})",
            f"**Author**: {author}",
            f"**Description**:\n{pr_body}\n",
            "## Review Comments:"
        ]
        
        for c in comments:
            c_author = c["user"]["login"]
            c_body = c["body"].replace('\n', ' ')
            content_lines.append(f"**{c_author}**: {c_body}")
            
        markdown_content = "\n\n".join(content_lines)
        file_bytes = markdown_content.encode("utf-8")
        filename = f"github/{repo_full_name}/pr_{pr_number}_context.md"
        
        db = supabase_manager.get_tenant_client(self.uuid_tenant)
        db_resp = db.table("documents").insert({
            "tenant_id": self.uuid_tenant,
            "filename": filename,
            "status": "pending"
        }).execute()
        
        document_id = db_resp.data[0]['id']
        background_tasks.add_task(
            background_ingestion_pipeline, 
            self.uuid_tenant, 
            document_id, 
            file_bytes,
            filename
        )
        
        return 1
