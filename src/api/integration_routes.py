import os
import requests
import base64
import io
import zipfile
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
async def github_auth(tenant_id: str):
    """Redirects the user to the GitHub OAuth approval screen."""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub Client ID not configured in .env")
    
    auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={GITHUB_CLIENT_ID}&scope=repo&state={tenant_id}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
    )
    return RedirectResponse(auth_url)

@router.get("/api/v1/integrations/github/callback")
async def github_callback(code: str, state: str):
    """Receives the OAuth code from GitHub, exchanges it for a token, and saves it."""
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")
        
    tenant_id = state
    
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
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    data = response.json()
    access_token = data.get("access_token")
    
    if not access_token:
        print("No access token in GitHub response:", data)
        return RedirectResponse(f"{FRONTEND_URL}/integrations?status=error")
        
    admin_db = supabase_manager.get_admin_client()
    
    uuid_tenant = get_tenant_uuid(tenant_id)
    
    admin_db.table("tenants").upsert({
        "id": uuid_tenant,
        "name": f"User {tenant_id}"
    }).execute()
    
    # Save the GitHub token
    admin_db.table("tenant_integrations").upsert({
        "tenant_id": uuid_tenant,
        "integration_type": "github",
        "access_token": access_token,
        "workspace_name": "GitHub Account"
    }, on_conflict="tenant_id, integration_type").execute()
    
    return RedirectResponse(f"{FRONTEND_URL}/integrations?status=success")

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
            background_tasks.add_task(background_ingestion_pipeline, uuid_tenant, document_id, file_bytes)
            files_queued += 1
            
    return {"message": f"Successfully queued {files_queued} markdown/text files for ingestion from {request.repo_full_name}."}
# Append these routes to integration_routes.py
@router.get("/api/v1/integrations/slack/auth")
async def slack_auth(tenant_id: str):
    """Redirects the user to the Slack OAuth approval screen."""
    SLACK_CLIENT_ID = os.environ.get("SLACK_CLIENT_ID", "mock_client_id")
    REDIRECT_URI = f"{os.environ.get('API_BASE_URL', 'http://localhost:8000')}/api/v1/integrations/slack/callback"
    auth_url = (
        f"https://slack.com/oauth/v2/authorize?"
        f"client_id={SLACK_CLIENT_ID}&scope=channels:history,channels:read,users:read&state={tenant_id}"
        f"&redirect_uri={REDIRECT_URI}"
    )
    return RedirectResponse(auth_url)

@router.get("/api/v1/integrations/slack/callback")
async def slack_callback(code: str, state: str):
    """Receives the OAuth code from Slack."""
    # In a real app, exchange `code` for a token here.
    return RedirectResponse(f"{FRONTEND_URL}/integrations?status=success")

@router.get("/api/v1/integrations/jira/auth")
async def jira_auth(tenant_id: str):
    """Redirects the user to the Jira OAuth approval screen."""
    JIRA_CLIENT_ID = os.environ.get("JIRA_CLIENT_ID", "mock_client_id")
    REDIRECT_URI = f"{os.environ.get('API_BASE_URL', 'http://localhost:8000')}/api/v1/integrations/jira/callback"
    auth_url = (
        f"https://auth.atlassian.com/authorize?"
        f"audience=api.atlassian.com&client_id={JIRA_CLIENT_ID}&scope=read:jira-work&redirect_uri={REDIRECT_URI}"
        f"&state={tenant_id}&response_type=code&prompt=consent"
    )
    return RedirectResponse(auth_url)

@router.get("/api/v1/integrations/jira/callback")
async def jira_callback(code: str, state: str):
    """Receives the OAuth code from Jira."""
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

from src.integrations.gdrive_crawler import GDriveCrawler

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
