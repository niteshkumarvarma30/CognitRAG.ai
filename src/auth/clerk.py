"""
Clerk JWT verification for CognitRAG v5 using PyJWT and JWKS.

Every API request must pass a valid Clerk session token in the Authorization
header. We verify the JWT locally (using JWKS) with zero round-trips to Clerk per request.
"""

from __future__ import annotations

import time
from typing import Optional
import httpx
import jwt
from jwt import PyJWKClient, ExpiredSignatureError, PyJWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from src.config import clerk as clerk_cfg

_bearer = HTTPBearer(auto_error=True)

_jwk_client: Optional[PyJWKClient] = None


def get_jwk_client() -> PyJWKClient:
    global _jwk_client
    if _jwk_client is None:
        _jwk_client = PyJWKClient(clerk_cfg.jwks_url, cache_jwk_set=True, lifespan=3600)
    return _jwk_client


class ClerkClaims(BaseModel):
    user_id: str
    session_id: str
    org_id: Optional[str] = None
    org_role: Optional[str] = None
    email: Optional[str] = None

    @property
    def is_org_admin(self) -> bool:
        return self.org_role == "org:admin"


async def verify_clerk_token(token: str) -> ClerkClaims:
    """Verify a Clerk session JWT and return structured claims."""
    try:
        jwk_client = get_jwk_client()
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        )

    return ClerkClaims(
        user_id=payload.get("sub", ""),
        session_id=payload.get("sid", ""),
        org_id=payload.get("org_id"),
        org_role=payload.get("org_role"),
        email=payload.get("email"),
    )


async def get_clerk_claims(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> ClerkClaims:
    return await verify_clerk_token(credentials.credentials)


async def require_org_admin(
    claims: ClerkClaims = Depends(get_clerk_claims),
) -> ClerkClaims:
    if not claims.is_org_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="org:admin role required",
        )
    return claims
