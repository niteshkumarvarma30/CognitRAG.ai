import os
import jwt
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWKClient
from pydantic import BaseModel

security = HTTPBearer()

# We need the JWKS URL from Clerk. It's usually based on the frontend key or domain, 
# but for backend validation, CLERK_SECRET_KEY or a direct JWKS URL is needed.
# Since we might not have it in .env yet, we'll try to reconstruct it or require it.
CLERK_ISSUER = os.environ.get("CLERK_ISSUER_URL") # e.g., https://clerk.your-domain.com
JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json" if CLERK_ISSUER else None

jwks_client = PyJWKClient(JWKS_URL) if JWKS_URL else None

class UserIdentity(BaseModel):
    user_id: str
    # In a full setup, we might also attach roles, but those live in our DB.

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> UserIdentity:
    token = credentials.credentials
    
    # For local development/testing without Clerk configured properly, allow a bypass
    if os.environ.get("ENV") == "development" and not JWKS_URL:
        # Fallback for dev: assume token IS the user_id if it doesn't look like a JWT
        if "." not in token:
            return UserIdentity(user_id=token)
            
    if not jwks_client:
        raise HTTPException(status_code=500, detail="CLERK_ISSUER_URL not configured")
        
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        data = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER
        )
        return UserIdentity(user_id=data["sub"])
    except jwt.PyJWKClientError as e:
        raise HTTPException(status_code=401, detail="Unable to fetch JWKS key")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

async def require_workspace_access(workspace_id: str, current_user: UserIdentity = Security(get_current_user)):
    """
    Dependency to verify that the current user has access to the requested workspace_id.
    This would query Supabase `workspace_memberships`.
    """
    from src.database.supabase_client import supabase_manager
    admin_db = supabase_manager.get_admin_client()
    
    # Check membership
    result = admin_db.table("workspace_memberships")\
        .select("role")\
        .eq("workspace_id", workspace_id)\
        .eq("user_id", current_user.user_id)\
        .execute()
        
    if not result.data:
        raise HTTPException(status_code=403, detail="Not authorized to access this workspace")
        
    return {"user_id": current_user.user_id, "workspace_id": workspace_id, "role": result.data[0]["role"]}
