import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from src.middleware.auth import get_current_user, require_workspace_access, UserIdentity
from src.database.supabase_client import supabase_manager

router = APIRouter(prefix="/api/v1", tags=["Workspaces"])

class WorkspaceCreate(BaseModel):
    name: str
    slug: str

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    role: str

@router.get("/me")
async def get_me(current_user: UserIdentity = Depends(get_current_user)):
    """
    Returns the user's profile and the list of workspaces they belong to.
    """
    admin_db = supabase_manager.get_admin_client()
    
    # Get all memberships for the user
    memberships_res = admin_db.table("workspace_memberships")\
        .select("workspace_id, role")\
        .eq("user_id", current_user.user_id)\
        .execute()
        
    memberships = memberships_res.data or []
    
    workspaces = []
    if memberships:
        workspace_ids = [m["workspace_id"] for m in memberships]
        ws_res = admin_db.table("workspaces")\
            .select("id, name, slug, plan")\
            .in_("id", workspace_ids)\
            .execute()
            
        ws_data = {ws["id"]: ws for ws in ws_res.data}
        
        for m in memberships:
            wid = m["workspace_id"]
            if wid in ws_data:
                workspaces.append({
                    "id": wid,
                    "name": ws_data[wid]["name"],
                    "slug": ws_data[wid]["slug"],
                    "plan": ws_data[wid]["plan"],
                    "role": m["role"]
                })
                
    return {
        "user_id": current_user.user_id,
        "workspaces": workspaces
    }

@router.post("/workspaces")
async def create_workspace(workspace: WorkspaceCreate, current_user: UserIdentity = Depends(get_current_user)):
    """
    Creates a new workspace and assigns the current user as an admin.
    """
    admin_db = supabase_manager.get_admin_client()
    
    # 1. Create workspace
    try:
        ws_res = admin_db.table("workspaces").insert({
            "name": workspace.name,
            "slug": workspace.slug
        }).execute()
    except Exception as e:
        # Catch unique constraint violations for slug
        raise HTTPException(status_code=400, detail=str(e))
        
    if not ws_res.data:
        raise HTTPException(status_code=500, detail="Failed to create workspace")
        
    new_ws = ws_res.data[0]
    
    # 2. Add membership
    admin_db.table("workspace_memberships").insert({
        "user_id": current_user.user_id,
        "workspace_id": new_ws["id"],
        "role": "admin"
    }).execute()
    
    # 3. Log audit event
    admin_db.table("audit_events").insert({
        "workspace_id": new_ws["id"],
        "actor_id": current_user.user_id,
        "action": "workspace.create",
        "resource_type": "workspace",
        "resource_id": new_ws["id"],
    }).execute()
    
    return new_ws

@router.get("/workspaces/{workspace_id}")
async def get_workspace(
    workspace_id: str, 
    access: dict = Depends(require_workspace_access)
):
    admin_db = supabase_manager.get_admin_client()
    ws_res = admin_db.table("workspaces").select("*").eq("id", workspace_id).execute()
    
    if not ws_res.data:
        raise HTTPException(status_code=404, detail="Workspace not found")
        
    ws = ws_res.data[0]
    ws["role"] = access["role"]
    return ws
