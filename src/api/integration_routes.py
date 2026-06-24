import os
import requests
import base64
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from src.database.supabase_client import supabase_manager

router = APIRouter()

NOTION_CLIENT_ID = os.environ.get("NOTION_CLIENT_ID")
NOTION_CLIENT_SECRET = os.environ.get("NOTION_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:8000/api/v1/integrations/notion/callback"
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

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
