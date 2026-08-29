import requests
from typing import Dict, List
from src.database.supabase_client import supabase_manager
from src.api.routes import background_ingestion_pipeline, get_tenant_uuid

class SlackCrawler:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.uuid_tenant = get_tenant_uuid(tenant_id)
        self.admin_db = supabase_manager.get_admin_client()
        self.token = self._get_slack_token()
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.user_map = self._fetch_user_map()

    def _get_slack_token(self) -> str:
        resp = self.admin_db.table("tenant_integrations")\
            .select("access_token")\
            .eq("tenant_id", self.tenant_id)\
            .eq("integration_type", "slack")\
            .execute()
        if not resp.data:
            raise ValueError(f"No Slack integration found for tenant {self.tenant_id}")
        return resp.data[0]["access_token"]

    def _fetch_user_map(self) -> Dict[str, str]:
        """Fetch all users to map user IDs to real names."""
        resp = requests.get("https://slack.com/api/users.list", headers=self.headers)
        if resp.status_code != 200 or not resp.json().get("ok"):
            print("Failed to fetch Slack users:", resp.text)
            return {}
        
        user_map = {}
        for user in resp.json().get("members", []):
            user_map[user["id"]] = user.get("real_name") or user.get("name")
        return user_map

    def get_channels(self) -> List[Dict]:
        """Fetch public channels the app has access to."""
        resp = requests.get(
            "https://slack.com/api/conversations.list", 
            headers=self.headers,
            params={"exclude_archived": True, "limit": 100}
        )
        if resp.status_code != 200 or not resp.json().get("ok"):
            print("Failed to fetch channels:", resp.text)
            return []
        return resp.json().get("channels", [])

    def fetch_channel_history(self, channel_id: str, limit: int = 50) -> List[Dict]:
        """Fetch latest messages in a channel."""
        resp = requests.get(
            "https://slack.com/api/conversations.history",
            headers=self.headers,
            params={"channel": channel_id, "limit": limit}
        )
        if resp.status_code != 200 or not resp.json().get("ok"):
            return []
        return resp.json().get("messages", [])

    def fetch_thread_replies(self, channel_id: str, thread_ts: str) -> List[Dict]:
        """Fetch all replies in a thread."""
        resp = requests.get(
            "https://slack.com/api/conversations.replies",
            headers=self.headers,
            params={"channel": channel_id, "ts": thread_ts}
        )
        if resp.status_code != 200 or not resp.json().get("ok"):
            return []
        return resp.json().get("messages", [])

    def format_message(self, msg: Dict) -> str:
        user_name = self.user_map.get(msg.get("user", ""), "Unknown User")
        text = msg.get("text", "").replace('\n', ' ')
        return f"**{user_name}**: {text}"

    def crawl_and_ingest(self, background_tasks):
        """Crawls accessible channels, formats threads to markdown, and queues for ingestion."""
        channels = self.get_channels()
        queued_count = 0
        
        db = supabase_manager.get_tenant_client(self.uuid_tenant)
        
        for channel in channels:
            channel_name = channel.get("name", "unknown_channel")
            channel_id = channel["id"]
            
            messages = self.fetch_channel_history(channel_id)
            
            for msg in messages:
                # We only want meaningful content (threads or long messages) to prevent noise
                thread_ts = msg.get("thread_ts")
                
                content_lines = []
                content_lines.append(f"# Slack Conversation in #{channel_name}")
                
                if thread_ts:
                    # It's a thread, fetch the full context
                    replies = self.fetch_thread_replies(channel_id, thread_ts)
                    for reply in replies:
                        content_lines.append(self.format_message(reply))
                else:
                    # Single message, only index if it's long enough to contain knowledge
                    if len(msg.get("text", "")) < 100:
                        continue
                    content_lines.append(self.format_message(msg))
                    
                markdown_content = "\n\n".join(content_lines)
                
                # Mock a filename for the document system
                doc_title = f"slack/{channel_name}/thread_{msg.get('ts')}.md"
                file_bytes = markdown_content.encode("utf-8")
                
                # Insert pending document
                db_resp = db.table("documents").insert({
                    "tenant_id": self.uuid_tenant,
                    "filename": doc_title,
                    "status": "pending"
                }).execute()
                
                document_id = db_resp.data[0]['id']
                
                # Queue the ingestion
                background_tasks.add_task(
                    background_ingestion_pipeline, 
                    self.uuid_tenant, 
                    document_id, 
                    file_bytes
                )
                queued_count += 1
                
        return queued_count
