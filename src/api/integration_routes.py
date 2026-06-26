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
REDIRECT_URI = "http://localhost:8000/api/v1/integrations/notion/callback"
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = "http://localhost:8000/api/v1/integrations/github/callback"

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
    
    # Ensure tenant exists in DB to prevent foreign key constraints
    admin_db.table("tenants").upsert({
        "id": tenant_id,
        "name": f"User {tenant_id}"
    }).execute()
    
    # Save the Notion token to the tenant_integrations table!
    admin_db.table("tenant_integrations").upsert({
        "tenant_id": tenant_id,
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
    
    admin_db.table("tenants").upsert({
        "id": tenant_id,
        "name": f"User {tenant_id}"
    }).execute()
    
    # Save the GitHub token
    admin_db.table("tenant_integrations").upsert({
        "tenant_id": tenant_id,
        "integration_type": "github",
        "access_token": access_token,
        "workspace_name": "GitHub Account"
    }, on_conflict="tenant_id, integration_type").execute()
    
    return RedirectResponse(f"{FRONTEND_URL}/integrations?status=success")

@router.get("/api/v1/integrations/github/repos")
def github_list_repos(tenant_id: str):
    """Lists the user's GitHub repositories."""
    admin_db = supabase_manager.get_admin_client()
    resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", tenant_id).eq("integration_type", "github").execute()
    
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
