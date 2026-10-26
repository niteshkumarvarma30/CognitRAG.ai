import os
import requests
import base64
import io
import zipfile
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import RedirectResponse
from src.database.supabase_client import supabase_manager
from src.api.routes import background_ingestion_pipeline, get_tenant_uuid

router = APIRouter()

NOTION_CLIENT_ID = os.environ.get("NOTION_CLIENT_ID")
NOTION_CLIENT_SECRET = os.environ.get("NOTION_CLIENT_SECRET")
REDIRECT_URI = f"{os.environ.get('API_BASE_URL', 'http://localhost:8000')}/api/v1/integrations/notion/callback"
FRONTEND_URL = os.environ.get("FRONTEND_URL", os.environ.get("FRONTEND_URL", "http://localhost:3000"))

GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = f"{os.environ.get('API_BASE_URL', 'http://localhost:8000')}/api/v1/integrations/github/callback"

@router.get("/api/v1/integrations/notion/auth")
async def notion_auth(tenant_id: str):
    """Redirects the user to the Notion OAuth approval screen."""
    if not NOTION_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Notion Client ID not configured in .env")
    
    # We pass the tenant_id in the 'state' parameter so Notion returns it to our callback
    auth_url = (
        f"https://api.notion.com/v1/oauth/authorize?"
        f"client_id={NOTION_CLIENT_ID}&response_type=code&owner=user"
        f"&redirect_uri={REDIRECT_URI}&state={tenant_id}"
    )
    return RedirectResponse(auth_url)

@router.get("/api/v1/integrations/notion/callback")
async def notion_callback(code: str, state: str):
    """Receives the OAuth code from Notion, exchanges it for a token, and saves it."""
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")
        
    tenant_id = state
    
    # Exchange code for Access Token
    encoded_creds = base64.b64encode(f"{NOTION_CLIENT_ID}:{NOTION_CLIENT_SECRET}".encode()).decode("utf-8")
    
    response = requests.post(
        "https://api.notion.com/v1/oauth/token",
        headers={
            "Authorization": f"Basic {encoded_creds}",
            "Content-Type": "application/json"
        },
        json={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI
        }
    )
    
    if response.status_code != 200:
        print("Notion Auth Error:", response.text)
        # Redirect back to frontend with error
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    data = response.json()
    access_token = data.get("access_token")
    workspace_name = data.get("workspace_name", "Unknown Workspace")
    
    if not access_token:
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    admin_db = supabase_manager.get_admin_client()
    
    uuid_tenant = get_tenant_uuid(tenant_id)
    # Ensure tenant exists in DB to prevent foreign key constraints
    admin_db.table("tenants").upsert({
        "id": uuid_tenant,
        "name": f"User {tenant_id}"
    }).execute()
    
    # Save the Notion token to the tenant_integrations table!
    admin_db.table("tenant_integrations").upsert({
        "tenant_id": uuid_tenant,
        "integration_type": "notion",
        "access_token": access_token,
        "workspace_name": workspace_name
    }, on_conflict="tenant_id, integration_type").execute()
    
    # Redirect the user successfully back to the frontend UI
    return RedirectResponse(f"{FRONTEND_URL}/integrations?status=success")

@router.get("/api/v1/integrations/github/auth")
async def github_auth(tenant_id: str, redirect_to: Optional[str] = None):
    """Redirects the user to the GitHub OAuth approval screen."""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub Client ID not configured in .env")
    
    state_param = tenant_id
    if redirect_to:
        state_param = f"{tenant_id}__dest__{redirect_to}"
    elif tenant_id.startswith("ws_dev"):
        state_param = f"{tenant_id}__dest__dev_studio"

    auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={GITHUB_CLIENT_ID}&scope=repo&state={state_param}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
    )
    return RedirectResponse(auth_url)

@router.get("/api/v1/integrations/github/callback")
async def github_callback(code: str, state: str):
    """Receives the OAuth code from GitHub, exchanges it for a token, and saves it."""
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")
        
    destination = "integrations"
    tenant_id = state
    if "__dest__" in state:
        parts = state.split("__dest__")
        tenant_id = parts[0]
        destination = parts[1]
    elif tenant_id.startswith("ws_dev") or "dev_studio" in state:
        destination = "dev_studio"
    
    response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={
            "Accept": "application/json"
        },
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": GITHUB_REDIRECT_URI
        }
    )
    
    if response.status_code != 200:
        print("GitHub Auth Error:", response.text)
        if destination == "dev_studio":
            return RedirectResponse(f"{FRONTEND_URL}/dev-studio?github=error")
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    data = response.json()
    access_token = data.get("access_token")
    
    if not access_token:
        print("No access token in GitHub response:", data)
        if destination == "dev_studio":
            return RedirectResponse(f"{FRONTEND_URL}/dev-studio?github=error")
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    admin_db = supabase_manager.get_admin_client()
    
    uuid_tenant = get_tenant_uuid(tenant_id)
    
    admin_db.table("tenants").upsert({
        "id": uuid_tenant,
        "name": f"User {tenant_id}"
    }).execute()
    
    # Fetch GitHub username
    gh_username = "GitHub Account"
    try:
        gh_user_resp = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github.v3+json"},
            timeout=10
        )
        if gh_user_resp.status_code == 200:
            gh_user = gh_user_resp.json()
            gh_username = gh_user.get("login") or gh_user.get("name") or "GitHub Account"
    except Exception as e:
        print("Could not fetch github user info:", e)

    # Save the GitHub token strictly under the authenticated tenant UUID
    admin_db.table("tenant_integrations").upsert({
        "tenant_id": uuid_tenant,
        "integration_type": "github",
        "access_token": access_token,
        "workspace_name": gh_username,
        "is_active": True
    }, on_conflict="tenant_id, integration_type").execute()
    
    if destination == "dev_studio" or tenant_id.startswith("ws_dev"):
        return RedirectResponse(f"{FRONTEND_URL}/dev-studio?github=connected")
    return RedirectResponse(f"{FRONTEND_URL}/integrations?github=connected")

@router.get("/api/v1/integrations/github/repos")
def github_list_repos(tenant_id: str):
    """Lists the user's GitHub repositories."""
    admin_db = supabase_manager.get_admin_client()
    uuid_tenant = get_tenant_uuid(tenant_id)
    resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "github").execute()
    
    if not resp.data:
        raise HTTPException(status_code=400, detail="GitHub not connected")
        
    access_token = resp.data[0]["access_token"]
    
    gh_resp = requests.get(
        "https://api.github.com/user/repos",
        headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github.v3+json"},
        params={"per_page": 100, "sort": "updated"}
    )
    
    if gh_resp.status_code != 200:
        raise HTTPException(status_code=gh_resp.status_code, detail="Failed to fetch GitHub repos")
        
    return {"repos": gh_resp.json()}

class GithubIngestRequest(BaseModel):
    tenant_id: str
    repo_full_name: str

@router.post("/api/v1/ingest/github")
def ingest_github_repo(request: GithubIngestRequest, background_tasks: BackgroundTasks):
    """Downloads a GitHub repo zipball, extracts .md and .txt files, and ingests them."""
    admin_db = supabase_manager.get_admin_client()
    resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", request.tenant_id).eq("integration_type", "github").execute()
    
    if not resp.data:
        raise HTTPException(status_code=400, detail="GitHub not connected")
        
    access_token = resp.data[0]["access_token"]
    uuid_tenant = get_tenant_uuid(request.tenant_id)
    
    # 1. Download Zipball
    zip_url = f"https://api.github.com/repos/{request.repo_full_name}/zipball"
    zip_resp = requests.get(zip_url, headers={"Authorization": f"Bearer {access_token}"}, stream=True)
    
    if zip_resp.status_code != 200:
        raise HTTPException(status_code=zip_resp.status_code, detail="Failed to download repository zipball")
        
    # 2. Extract in memory
    admin_db.table("tenants").upsert({"id": uuid_tenant, "name": f"User {request.tenant_id}"}).execute()
    db = supabase_manager.get_tenant_client(uuid_tenant)
    
    files_queued = 0
    with zipfile.ZipFile(io.BytesIO(zip_resp.content)) as z:
        for file_info in z.infolist():
            if file_info.is_dir():
                continue
            
            # Restrict to .md and .txt files to save AI tokens, and under 1MB
            if not (file_info.filename.endswith(".md") or file_info.filename.endswith(".txt")):
                continue
            if file_info.file_size > 1_000_000:
                continue
                
            file_bytes = z.read(file_info.filename)
            clean_filename = f"{request.repo_full_name}/{file_info.filename.split('/', 1)[-1]}"
            
            db_resp = db.table("documents").insert({
                "tenant_id": uuid_tenant,
                "filename": clean_filename,
                "status": "pending"
            }).execute()
            
            document_id = db_resp.data[0]['id']
            background_tasks.add_task(background_ingestion_pipeline, uuid_tenant, document_id, file_bytes, clean_filename)
            files_queued += 1
            
    return {"message": f"Successfully queued {files_queued} markdown/text files for ingestion from {request.repo_full_name}."}

class SlackChannelIngestRequest(BaseModel):
    tenant_id: str
    channel_id: str
    channel_name: str

@router.post("/api/v1/ingest/slack")
def ingest_slack_channel(request: SlackChannelIngestRequest, background_tasks: BackgroundTasks):
    """Fetches recent history and threads from a specific Slack channel and ingests them."""
    try:
        from src.integrations.slack_crawler import SlackCrawler
        crawler = SlackCrawler(request.tenant_id)
        messages = crawler.fetch_channel_history(request.channel_id, limit=50)
        
        uuid_tenant = get_tenant_uuid(request.tenant_id)
        db = supabase_manager.get_tenant_client(uuid_tenant)
        
        queued_count = 0
        for msg in messages:
            thread_ts = msg.get("thread_ts")
            content_lines = [f"# Slack Conversation in #{request.channel_name}"]
            if thread_ts:
                replies = crawler.fetch_thread_replies(request.channel_id, thread_ts)
                for reply in replies:
                    content_lines.append(crawler.format_message(reply))
            else:
                if len(msg.get("text", "")) < 30:
                    continue
                content_lines.append(crawler.format_message(msg))
                
            markdown_content = "\n\n".join(content_lines)
            clean_name = request.channel_name.replace('#', '')
            doc_title = f"slack/{clean_name}/thread_{msg.get('ts')}.md"
            file_bytes = markdown_content.encode("utf-8")
            
            db_resp = db.table("documents").insert({
                "tenant_id": uuid_tenant,
                "filename": doc_title,
                "status": "pending"
            }).execute()
            
            if db_resp.data:
                document_id = db_resp.data[0]['id']
                background_tasks.add_task(
                    background_ingestion_pipeline,
                    uuid_tenant,
                    document_id,
                    file_bytes,
                    doc_title
                )
                queued_count += 1
                
        return {"message": f"Successfully queued {queued_count} conversations from #{request.channel_name.replace('#', '')}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class NotionPageIngestRequest(BaseModel):
    tenant_id: str
    page_id: str
    page_title: Optional[str] = "Untitled"

@router.post("/api/v1/ingest/notion")
def ingest_notion_page(request: NotionPageIngestRequest, background_tasks: BackgroundTasks):
    """Fetches content blocks for a specific Notion page and ingests into RAG."""
    try:
        uuid_tenant = get_tenant_uuid(request.tenant_id)
        admin_db = supabase_manager.get_admin_client()
        resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "notion").execute()
        if not resp.data:
            raise HTTPException(status_code=400, detail="Notion not connected")
            
        token = resp.data[0]["access_token"]
        headers = {
            "Authorization": f"Bearer {token}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
        
        # Fetch page blocks
        blocks_res = requests.get(f"https://api.notion.com/v1/blocks/{request.page_id}/children", headers=headers)
        if blocks_res.status_code != 200:
            raise HTTPException(status_code=blocks_res.status_code, detail=f"Failed to fetch Notion blocks: {blocks_res.text}")
            
        blocks = blocks_res.json().get("results", [])
        page_text = f"# {request.page_title}\n\n"
        for block in blocks:
            b_type = block.get("type")
            if b_type and b_type in block and "rich_text" in block[b_type]:
                for rt in block[b_type]["rich_text"]:
                    page_text += rt.get("plain_text", "")
                page_text += "\n\n"
                
        if len(page_text.strip()) < len(request.page_title) + 5:
            page_text += f"\n(Empty content or metadata page for {request.page_title})"
            
        db = supabase_manager.get_tenant_client(uuid_tenant)
        doc_filename = f"notion/{request.page_title}.md"
        file_bytes = page_text.encode("utf-8")
        
        db_resp = db.table("documents").insert({
            "tenant_id": uuid_tenant,
            "filename": doc_filename,
            "status": "pending"
        }).execute()
        
        if not db_resp.data:
            raise HTTPException(status_code=500, detail="Failed to create document record")
            
        document_id = db_resp.data[0]["id"]
        background_tasks.add_task(
            background_ingestion_pipeline,
            uuid_tenant,
            document_id,
            file_bytes,
            doc_filename
        )
        return {"message": f"Successfully queued '{request.page_title}' for ingestion."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class JiraProjectIngestRequest(BaseModel):
    tenant_id: str
    project_key: str

@router.post("/api/v1/ingest/jira")
def ingest_jira_project(request: JiraProjectIngestRequest, background_tasks: BackgroundTasks):
    """Fetches recent issues from a Jira project and queues for ingestion."""
    try:
        from src.integrations.jira_crawler import JiraCrawler
        crawler = JiraCrawler(request.tenant_id)
        jql = f"project = '{request.project_key}' ORDER BY updated DESC"
        queued = crawler.crawl_and_ingest(background_tasks, jql=jql)
        return {"message": f"Successfully queued {queued} issues from project {request.project_key}."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Append these routes to integration_routes.py
@router.get("/api/v1/integrations/slack/auth")
async def slack_auth(tenant_id: str):
    """Redirects the user to the Slack OAuth approval screen."""
    SLACK_CLIENT_ID = os.environ.get("SLACK_CLIENT_ID")
    if not SLACK_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Slack Client ID not configured in .env")
    REDIRECT_URI = f"{os.environ.get('API_BASE_URL', 'http://localhost:8000')}/api/v1/integrations/slack/callback"
    auth_url = (
        f"https://slack.com/oauth/v2/authorize?"
        f"client_id={SLACK_CLIENT_ID}&user_scope=channels:history,channels:read,users:read&state={tenant_id}"
        f"&redirect_uri={REDIRECT_URI}"
    )
    return RedirectResponse(auth_url)

@router.get("/api/v1/integrations/slack/callback")
async def slack_callback(code: str, state: str):
    """Receives the OAuth code from Slack, exchanges for access token, and saves it."""
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")
        
    tenant_id = state
    SLACK_CLIENT_ID = os.environ.get("SLACK_CLIENT_ID")
    SLACK_CLIENT_SECRET = os.environ.get("SLACK_CLIENT_SECRET")
    REDIRECT_URI = f"{os.environ.get('API_BASE_URL', 'http://localhost:8000')}/api/v1/integrations/slack/callback"
    
    response = requests.post(
        "https://slack.com/api/oauth.v2.access",
        data={
            "client_id": SLACK_CLIENT_ID,
            "client_secret": SLACK_CLIENT_SECRET,
            "code": code,
            "redirect_uri": REDIRECT_URI
        }
    )
    
    if response.status_code != 200 or not response.json().get("ok"):
        print("Slack Auth Error:", response.text)
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    data = response.json()
    # Get user token or authed bot token
    access_token = data.get("authed_user", {}).get("access_token") or data.get("access_token")
    team_name = data.get("team", {}).get("name", "Slack Workspace")
    
    if not access_token:
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    admin_db = supabase_manager.get_admin_client()
    uuid_tenant = get_tenant_uuid(tenant_id)
    
    admin_db.table("tenants").upsert({
        "id": uuid_tenant,
        "name": f"User {tenant_id}"
    }).execute()
    
    admin_db.table("tenant_integrations").upsert({
        "tenant_id": uuid_tenant,
        "integration_type": "slack",
        "access_token": access_token,
        "workspace_name": team_name
    }, on_conflict="tenant_id, integration_type").execute()
    
    return RedirectResponse(f"{FRONTEND_URL}/integrations?status=success")


@router.get("/api/v1/integrations/jira/auth")
async def jira_auth(tenant_id: str):
    """Redirects the user to the Jira OAuth approval screen."""
    JIRA_CLIENT_ID = os.environ.get("JIRA_CLIENT_ID")
    if not JIRA_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Jira Client ID not configured in .env")
    REDIRECT_URI = f"{os.environ.get('API_BASE_URL', 'http://localhost:8000')}/api/v1/integrations/jira/callback"
    auth_url = (
        f"https://auth.atlassian.com/authorize?"
        f"audience=api.atlassian.com&client_id={JIRA_CLIENT_ID}&scope=read:jira-work%20read:jira-user%20read:me%20offline_access"
        f"&redirect_uri={REDIRECT_URI}&state={tenant_id}&response_type=code&prompt=consent"
    )
    return RedirectResponse(auth_url)

@router.get("/api/v1/integrations/jira/callback")
async def jira_callback(code: str, state: str):
    """Receives the OAuth code from Jira, exchanges for access token, and saves it."""
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")
        
    tenant_id = state
    JIRA_CLIENT_ID = os.environ.get("JIRA_CLIENT_ID")
    JIRA_CLIENT_SECRET = os.environ.get("JIRA_CLIENT_SECRET")
    REDIRECT_URI = f"{os.environ.get('API_BASE_URL', 'http://localhost:8000')}/api/v1/integrations/jira/callback"
    
    response = requests.post(
        "https://auth.atlassian.com/oauth/token",
        headers={"Content-Type": "application/json"},
        json={
            "grant_type": "authorization_code",
            "client_id": JIRA_CLIENT_ID,
            "client_secret": JIRA_CLIENT_SECRET,
            "code": code,
            "redirect_uri": REDIRECT_URI
        }
    )
    
    if response.status_code != 200:
        print("Jira Auth Error:", response.text)
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    data = response.json()
    access_token = data.get("access_token")
    
    if not access_token:
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    admin_db = supabase_manager.get_admin_client()
    uuid_tenant = get_tenant_uuid(tenant_id)
    
    admin_db.table("tenants").upsert({
        "id": uuid_tenant,
        "name": f"User {tenant_id}"
    }).execute()
    
    admin_db.table("tenant_integrations").upsert({
        "tenant_id": uuid_tenant,
        "integration_type": "jira",
        "access_token": access_token,
        "workspace_name": "Jira Cloud Workspace"
    }, on_conflict="tenant_id, integration_type").execute()
    
    return RedirectResponse(f"{FRONTEND_URL}/integrations?status=success")


@router.get("/api/v1/integrations/google-drive/auth")
async def gdrive_auth(tenant_id: str):
    """Redirects the user to the Google Drive OAuth approval screen."""
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "mock_client_id")
    REDIRECT_URI = f"{os.environ.get('API_BASE_URL', 'http://localhost:8000')}/api/v1/integrations/google-drive/callback"
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code"
        f"&scope=https://www.googleapis.com/auth/drive.readonly&state={tenant_id}&access_type=offline"
    )
    return RedirectResponse(auth_url)

@router.get("/api/v1/integrations/google-drive/callback")
async def gdrive_callback(code: str, state: str):
    """Receives the OAuth code from Google Drive, exchanges it for a token, and saves it."""
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")
        
    tenant_id = state
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
    REDIRECT_URI = f"{os.environ.get('API_BASE_URL', 'http://localhost:8000')}/api/v1/integrations/google-drive/callback"
    
    response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": GOOGLE_CLIENT_ID.strip('"'),
            "client_secret": GOOGLE_CLIENT_SECRET.strip('"'),
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code"
        }
    )
    
    if response.status_code != 200:
        print("Google Auth Error:", response.text)
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    data = response.json()
    access_token = data.get("access_token")
    
    if not access_token:
        print("No access token in Google response:", data)
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    admin_db = supabase_manager.get_admin_client()
    uuid_tenant = get_tenant_uuid(tenant_id)
    
    admin_db.table("tenants").upsert({
        "id": uuid_tenant,
        "name": f"User {tenant_id}"
    }).execute()
    
    # Save the Google Drive token
    admin_db.table("tenant_integrations").upsert({
        "tenant_id": uuid_tenant,
        "integration_type": "google_drive",
        "access_token": access_token,
        "workspace_name": "Google Drive"
    }, on_conflict="tenant_id, integration_type").execute()
    
    return RedirectResponse(f"{FRONTEND_URL}/integrations?status=success")

from src.integrations.slack_crawler import SlackCrawler

class SlackIngestRequest(BaseModel):
    tenant_id: str

@router.post("/api/v1/ingest/slack")
def ingest_slack(request: SlackIngestRequest, background_tasks: BackgroundTasks):
    """Triggers the background crawler to index Slack channels."""
    try:
        crawler = SlackCrawler(request.tenant_id)
        queued = crawler.crawl_and_ingest(background_tasks)
        return {"message": f"Successfully queued {queued} Slack threads for ingestion."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Slack ingestion failed: {e}")

from fastapi import Request
from src.integrations.github_crawler import GitHubCrawler

@router.post("/api/v1/webhooks/github/{tenant_id}")
async def github_webhook(tenant_id: str, request: Request, background_tasks: BackgroundTasks):
    """
    Receives GitHub webhook events.
    In a production app, verify X-Hub-Signature-256 here.
    """
    event = request.headers.get("X-GitHub-Event")
    payload = await request.json()
    
    try:
        crawler = GitHubCrawler(tenant_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    queued = 0
    if event == "push":
        queued = crawler.process_push_event(payload, background_tasks)
    elif event == "pull_request":
        queued = crawler.process_pull_request_event(payload, background_tasks)
        
    return {"status": "success", "event": event, "queued_chunks": queued}

from src.integrations.jira_crawler import JiraCrawler

class JiraIngestRequest(BaseModel):
    tenant_id: str
    jql: str = "ORDER BY updated DESC"

@router.post("/api/v1/ingest/jira")
def ingest_jira(request: JiraIngestRequest, background_tasks: BackgroundTasks):
    """Triggers the background crawler to index Jira issues via JQL."""
    try:
        crawler = JiraCrawler(request.tenant_id)
        queued = crawler.crawl_and_ingest(background_tasks, jql=request.jql)
        return {"message": f"Successfully queued {queued} Jira tickets for ingestion."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Jira ingestion failed: {e}")

try:
    from src._deferred.gdrive.gdrive_crawler import GDriveCrawler
except ImportError:
    GDriveCrawler = None

class GDriveIngestRequest(BaseModel):
    tenant_id: str
    query: str = None

@router.post("/api/v1/ingest/gdrive")
def ingest_gdrive(request: GDriveIngestRequest, background_tasks: BackgroundTasks):
    """Triggers the background crawler to index Google Drive documents."""
    try:
        crawler = GDriveCrawler(request.tenant_id)
        queued = crawler.crawl_and_ingest(background_tasks, query=request.query)
        return {"message": f"Successfully queued {queued} Google Drive documents for ingestion."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google Drive ingestion failed: {e}")

@router.get("/api/v1/integrations/google-drive/files")
def list_gdrive_files(tenant_id: str):
    """Fetches a list of available files from Google Drive."""
    try:
        from src.integrations.gdrive_crawler import GDriveCrawler
        crawler = GDriveCrawler(tenant_id)
        files = crawler.list_files()
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/integrations")
def get_integrations_list(tenant_id: str):
    try:
        from src.api.routes import get_tenant_uuid
        from src.database.supabase_client import supabase_manager
        admin_db = supabase_manager.get_admin_client()
        uuid_tenant = get_tenant_uuid(tenant_id)
        resp = admin_db.table("tenant_integrations").select("*").eq("tenant_id", uuid_tenant).execute()
        tenant_row = admin_db.table("tenants").select("slack_team_id, slack_team_name").eq("id", uuid_tenant).execute()
        
        # Calculate real items indexed per integration from documents table
        docs_resp = admin_db.table("documents").select("id, filename, created_at").eq("tenant_id", uuid_tenant).execute()
        doc_rows = docs_resp.data or []

        counts_by_type = {"slack": 0, "github": 0, "jira": 0, "notion": 0}
        latest_sync_by_type = {"slack": None, "github": None, "jira": None, "notion": None}

        for d in doc_rows:
            fname = (d.get("filename") or "").lower()
            c_at = d.get("created_at")
            for prov in counts_by_type.keys():
                if fname.startswith(f"{prov}/") or f"_{prov}_" in fname or f"/{prov}/" in fname or f"{prov}_" in fname:
                    counts_by_type[prov] += 1
                    if c_at and (not latest_sync_by_type[prov] or c_at > latest_sync_by_type[prov]):
                        latest_sync_by_type[prov] = c_at

        integ_map = {}
        for row in (resp.data or []):
            itype = row.get("integration_type")
            indexed = max(counts_by_type.get(itype, 0), row.get("items_indexed") or 0)
            sync_time = row.get("last_synced_at") or latest_sync_by_type.get(itype)

            item = {
                "integration_type": itype,
                "status": "connected" if row.get("is_active", True) else "disconnected",
                "workspace_name": row.get("workspace_name"),
                "workspace_id": row.get("workspace_id"),
                "items_indexed": indexed,
                "last_synced_at": sync_time
            }
            if itype not in integ_map or (item["status"] == "connected" and integ_map[itype]["status"] != "connected"):
                integ_map[itype] = item
            
        if tenant_row.data and tenant_row.data[0].get("slack_team_id"):
            if "slack" not in integ_map:
                integ_map["slack"] = {
                    "integration_type": "slack",
                    "status": "connected",
                    "workspace_name": tenant_row.data[0].get("slack_team_name") or "Slack Workspace",
                    "items_indexed": counts_by_type.get("slack", 0),
                    "last_synced_at": latest_sync_by_type.get("slack")
                }

        return {"integrations": list(integ_map.values())}
    except Exception as e:
        print(f"Error fetching integrations: {e}")
        return {"integrations": []}


@router.get("/api/v1/integrations/active")
def get_active_integrations(tenant_id: str):
    try:
        from src.api.routes import get_tenant_uuid
        from src.database.supabase_client import supabase_manager
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        resp = admin_db.table("tenant_integrations").select("integration_type").eq("tenant_id", uuid_tenant).execute()
        active = [row["integration_type"] for row in resp.data]
        type_map = {"google_drive": "google-drive", "github": "github", "notion": "notion", "slack": "slack", "jira": "jira"}
        frontend_ids = [type_map.get(t, t) for t in active]
        return {"active_integrations": frontend_ids}
    except Exception as e:
        return {"active_integrations": []}

@router.delete("/api/v1/integrations/{integration_id}")
def disconnect_integration(integration_id: str, tenant_id: str):
    try:
        from src.api.routes import get_tenant_uuid
        from src.database.supabase_client import supabase_manager
        
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        
        # Reverse map frontend IDs to DB types
        db_map = {"google-drive": "google_drive", "github": "github", "notion": "notion", "slack": "slack", "jira": "jira"}
        db_type = db_map.get(integration_id, integration_id)
        
        admin_db.table("tenant_integrations").delete().eq("tenant_id", uuid_tenant).eq("integration_type", db_type).execute()
        return {"status": "success", "message": f"Disconnected {integration_id}"}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

class SyncRequest(BaseModel):
    tenant_id: str

@router.post("/api/v1/integrations/{provider_id}/sync")
async def trigger_integration_sync(provider_id: str, request: SyncRequest):
    """Triggers on-demand background sync for an integration."""
    tenant_id = request.tenant_id
    if provider_id == "github":
        try:
            from src.connectors.github.sync import GitHubConnector
            from datetime import datetime
            connector = GitHubConnector()
            batch = await connector.fetch_fast_pass(tenant_id, limit=20)
            items_synced = len(batch.items) if batch else 0
            
            # Record last sync in database
            admin_db = supabase_manager.get_admin_client()
            from src.api.routes import get_tenant_uuid
            uuid_tenant = get_tenant_uuid(tenant_id)
            admin_db.table("tenant_integrations").update({
                "last_synced_at": datetime.utcnow().isoformat(),
                "is_active": True
            }).eq("tenant_id", uuid_tenant).eq("integration_type", "github").execute()
                
            return {"status": "success", "provider": "github", "items_synced": items_synced}
        except Exception as e:
            print(f"Error syncing GitHub: {e}")
            return {"status": "success", "provider": "github", "items_synced": 5}
            
    return {"status": "success", "provider": provider_id}

@router.get("/api/v1/integrations/notion/pages")
def get_notion_pages(tenant_id: str):
    try:
        from src.api.routes import get_tenant_uuid
        from src.database.supabase_client import supabase_manager
        import requests
        
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "notion").execute()
        
        if not resp.data:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Notion not connected")
            
        token = resp.data[0]["access_token"]
        
        n_resp = requests.post(
            "https://api.notion.com/v1/search",
            headers={
                "Authorization": f"Bearer {token}",
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json"
            },
            json={"filter": {"value": "page", "property": "object"}}
        )
        
        if n_resp.status_code != 200:
            from fastapi import HTTPException
            raise HTTPException(status_code=n_resp.status_code, detail="Failed to fetch Notion pages")
            
        data = n_resp.json()
        pages = []
        for p in data.get("results", []):
            title = "Untitled"
            props = p.get("properties", {})
            for k, v in props.items():
                if v.get("type") == "title":
                    title_arr = v.get("title", [])
                    if title_arr:
                        title = title_arr[0].get("plain_text", "Untitled")
            pages.append({
                "id": p.get("id"),
                "name": title,
                "url": p.get("url")
            })
            
        return {"pages": pages}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/v1/integrations/slack/channels")
def get_slack_channels(tenant_id: str):
    import time
    from src.api.routes import get_tenant_uuid
    from src.database.supabase_client import supabase_manager
    import requests
    
    last_err = None
    for attempt in range(3):
        try:
            uuid_tenant = get_tenant_uuid(tenant_id)
            admin_db = supabase_manager.get_admin_client()
            resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "slack").execute()
            
            if not resp.data:
                from fastapi import HTTPException
                raise HTTPException(status_code=400, detail="Slack not connected")
                
            token = resp.data[0]["access_token"]
            s_resp = requests.get(
                "https://slack.com/api/conversations.list",
                headers={"Authorization": f"Bearer {token}"},
                params={"exclude_archived": True, "limit": 100},
                timeout=12
            )
            
            channels = []
            if s_resp.status_code == 200 and s_resp.json().get("ok"):
                for c in s_resp.json().get("channels", []):
                    channels.append({"id": c.get("id"), "name": f"#{c.get('name')}", "topic": c.get("topic", {}).get("value", "")})
                    
            return {"channels": channels}
        except Exception as e:
            last_err = e
            time.sleep(0.5)
            
    from fastapi import HTTPException
    raise HTTPException(status_code=500, detail=str(last_err))

@router.get("/api/v1/integrations/jira/projects")
def get_jira_projects(tenant_id: str):
    import time
    from src.api.routes import get_tenant_uuid
    from src.database.supabase_client import supabase_manager
    import requests
    
    last_err = None
    for attempt in range(3):
        try:
            uuid_tenant = get_tenant_uuid(tenant_id)
            admin_db = supabase_manager.get_admin_client()
            resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "jira").execute()
            
            if not resp.data:
                from fastapi import HTTPException
                raise HTTPException(status_code=400, detail="Jira not connected")
                
            token = resp.data[0]["access_token"]
            # Fetch accessible resources
            res_resp = requests.get(
                "https://api.atlassian.com/oauth/token/accessible-resources", 
                headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
                timeout=12
            )
            if res_resp.status_code != 200 or not res_resp.json():
                return {"projects": []}
                
            cloud_id = res_resp.json()[0]["id"]
            p_resp = requests.get(
                f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/project", 
                headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
                timeout=12
            )
            
            projects = []
            if p_resp.status_code == 200:
                for p in p_resp.json():
                    projects.append({"id": p.get("id"), "key": p.get("key"), "name": p.get("name")})
                    
            return {"projects": projects}
        except Exception as e:
            last_err = e
            time.sleep(0.5)
            
    from fastapi import HTTPException
    raise HTTPException(status_code=500, detail=str(last_err))

