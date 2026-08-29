import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from src.middleware.rbac import require_permission
from src.database.supabase_client import supabase_manager

router = APIRouter(prefix="/api/v1/security", tags=["Security"])

class UserInvite(BaseModel):
    email: str
    role: str

class RoleUpdate(BaseModel):
    role: str

@router.get("/users")
async def list_workspace_users(
    workspace_context: dict = Depends(require_permission("security.manage"))
):
    """List all members and their roles for the current workspace."""
    admin_db = supabase_manager.get_admin_client()
    workspace_id = workspace_context["workspace_id"]
    
    res = admin_db.table("workspace_memberships")\
        .select("user_id, role, created_at")\
        .eq("workspace_id", workspace_id)\
        .execute()
        
    return res.data or []

@router.post("/users/invite")
async def invite_user(
    invite: UserInvite,
    workspace_context: dict = Depends(require_permission("security.manage"))
):
    """
    Invites a user to the workspace.
    In a real implementation, this would trigger a Clerk invitation email.
    """
    if invite.role not in ["admin", "member", "viewer"]:
        raise HTTPException(status_code=400, detail="Invalid role specified.")
        
    workspace_id = workspace_context["workspace_id"]
    actor_id = workspace_context["user_id"]
    
    # Mocking user_id resolution from email
    mock_user_id = f"user_{invite.email.replace('@', '_').replace('.', '_')}"
    
    admin_db = supabase_manager.get_admin_client()
    
    # Insert membership
    try:
        admin_db.table("workspace_memberships").insert({
            "workspace_id": workspace_id,
            "user_id": mock_user_id,
            "role": invite.role
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail="User is already a member.")
        
    # Audit log
    admin_db.table("audit_events").insert({
        "workspace_id": workspace_id,
        "actor_id": actor_id,
        "action": "user.invite",
        "resource_type": "user",
        "resource_id": mock_user_id,
        "metadata": {"role": invite.role, "email": invite.email}
    }).execute()
    
    return {"status": "success", "user_id": mock_user_id, "role": invite.role}

@router.patch("/users/{user_id}")
async def update_user_role(
    user_id: str,
    update: RoleUpdate,
    workspace_context: dict = Depends(require_permission("security.manage"))
):
    """Updates a member's role in the workspace."""
    if update.role not in ["admin", "member", "viewer"]:
        raise HTTPException(status_code=400, detail="Invalid role specified.")
        
    workspace_id = workspace_context["workspace_id"]
    actor_id = workspace_context["user_id"]
    
    admin_db = supabase_manager.get_admin_client()
    
    res = admin_db.table("workspace_memberships")\
        .update({"role": update.role})\
        .eq("workspace_id", workspace_id)\
        .eq("user_id", user_id)\
        .execute()
        
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found in workspace.")
        
    admin_db.table("audit_events").insert({
        "workspace_id": workspace_id,
        "actor_id": actor_id,
        "action": "user.update_role",
        "resource_type": "user",
        "resource_id": user_id,
        "metadata": {"new_role": update.role}
    }).execute()
    
    return {"status": "success", "new_role": update.role}

@router.get("/audit")
async def list_audit_events(
    limit: int = 50,
    workspace_context: dict = Depends(require_permission("security.manage"))
):
    """Retrieve immutable audit events for security review."""
    workspace_id = workspace_context["workspace_id"]
    admin_db = supabase_manager.get_admin_client()
    
    res = admin_db.table("audit_events")\
        .select("*")\
        .eq("workspace_id", workspace_id)\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
        
    return res.data or []
