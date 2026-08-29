from fastapi import HTTPException, Depends, Request
from functools import wraps
from typing import List, Callable, Coroutine, Any

from src.middleware.auth import get_current_user, require_workspace_access, UserIdentity

# Define role-to-permissions mapping
ROLE_PERMISSIONS = {
    "admin": [
        "knowledge.read",
        "knowledge.write",
        "knowledge.approve",
        "integration.manage",
        "security.manage"
    ],
    "member": [
        "knowledge.read",
        "knowledge.write"
    ],
    "viewer": [
        "knowledge.read"
    ]
}

def require_permission(permission: str):
    """
    FastAPI dependency that enforces RBAC.
    Validates that the user's role in the current workspace grants them the requested permission.
    """
    async def permission_checker(
        workspace_context: dict = Depends(require_workspace_access)
    ):
        role = workspace_context.get("role", "viewer")
        allowed_permissions = ROLE_PERMISSIONS.get(role, [])
        
        if permission not in allowed_permissions:
            raise HTTPException(
                status_code=403, 
                detail=f"Action forbidden: requires {permission} permission."
            )
            
        return workspace_context
    return permission_checker
