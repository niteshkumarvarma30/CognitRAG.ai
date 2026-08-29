import requests
from typing import Dict, Any, List
from src.database.supabase_client import supabase_manager
from src.api.routes import background_ingestion_pipeline, get_tenant_uuid

class JiraCrawler:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.uuid_tenant = get_tenant_uuid(tenant_id)
        self.admin_db = supabase_manager.get_admin_client()
        self.token = self._get_jira_token()
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/json"
        }
        self.cloud_id = self._get_cloud_id()

    def _get_jira_token(self) -> str:
        resp = self.admin_db.table("tenant_integrations")\
            .select("access_token")\
            .eq("tenant_id", self.tenant_id)\
            .eq("integration_type", "jira")\
            .execute()
        if not resp.data:
            raise ValueError(f"No Jira integration found for tenant {self.tenant_id}")
        return resp.data[0]["access_token"]

    def _get_cloud_id(self) -> str:
        """Fetch the first accessible Jira cloud_id using the OAuth token."""
        resp = requests.get(
            "https://api.atlassian.com/oauth/token/accessible-resources", 
            headers=self.headers
        )
        if resp.status_code != 200 or not resp.json():
            raise ValueError("Failed to fetch Jira accessible resources or no sites authorized.")
        # Return the cloud_id of the first authorized site
        return resp.json()[0]["id"]

    def _extract_text_from_adf(self, adf_node: Dict) -> str:
        """Extremely basic extractor for Atlassian Document Format (ADF) to plain text."""
        if not adf_node or not isinstance(adf_node, dict):
            return ""
        
        text = ""
        if adf_node.get("type") == "text":
            return adf_node.get("text", "")
            
        for content in adf_node.get("content", []):
            text += self._extract_text_from_adf(content) + " "
            
        if adf_node.get("type") == "paragraph":
            text += "\n\n"
            
        return text

    def fetch_issues(self, jql: str = "ORDER BY updated DESC", max_results: int = 50) -> List[Dict]:
        """Executes a JQL search to fetch issues."""
        url = f"https://api.atlassian.com/ex/jira/{self.cloud_id}/rest/api/3/search"
        payload = {
            "jql": jql,
            "maxResults": max_results,
            "fields": ["summary", "description", "issuetype", "status", "assignee", "reporter", "comment"]
        }
        resp = requests.post(url, headers=self.headers, json=payload)
        
        if resp.status_code != 200:
            print(f"Jira API error: {resp.text}")
            return []
            
        return resp.json().get("issues", [])

    def crawl_and_ingest(self, background_tasks, jql: str = "ORDER BY updated DESC") -> int:
        """Crawls Jira issues and queues them for semantic ingestion."""
        issues = self.fetch_issues(jql=jql)
        queued = 0
        
        db = supabase_manager.get_tenant_client(self.uuid_tenant)
        
        for issue in issues:
            key = issue["key"]
            fields = issue["fields"]
            
            summary = fields.get("summary", "No Title")
            issue_type = fields.get("issuetype", {}).get("name", "Issue")
            status = fields.get("status", {}).get("name", "Unknown")
            assignee = fields.get("assignee", {}).get("displayName", "Unassigned") if fields.get("assignee") else "Unassigned"
            
            description_adf = fields.get("description")
            description_text = self._extract_text_from_adf(description_adf) if description_adf else "No description."
            
            content_lines = [
                f"# [{key}] {summary}",
                f"**Type**: {issue_type} | **Status**: {status} | **Assignee**: {assignee}",
                "\n## Description",
                description_text
            ]
            
            comments_obj = fields.get("comment", {}).get("comments", [])
            if comments_obj:
                content_lines.append("\n## Comments")
                for comment in comments_obj:
                    author = comment.get("author", {}).get("displayName", "Unknown")
                    body_text = self._extract_text_from_adf(comment.get("body"))
                    content_lines.append(f"**{author}**: {body_text}")
                    
            markdown_content = "\n".join(content_lines)
            
            # Save and queue document
            filename = f"jira/{key}_context.md"
            file_bytes = markdown_content.encode("utf-8")
            
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
                file_bytes
            )
            queued += 1
            
        return queued
