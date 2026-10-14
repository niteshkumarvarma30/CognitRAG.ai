"""
Clerk JWT verification for CognitRAG v5.

Every API request must pass a valid Clerk session token in the Authorization
header.  We verify the JWT locally (using JWKS) so there is no round-trip to
Clerk on every request.

Usage (FastAPI dependency):
    from src.auth.clerk import get_clerk_claims

    @router.get("/me")
    async def me(claims: ClerkClaims = Depends(get_clerk_claims)):
        return {"user_id": claims.user_id}
"""

from __future__ import annotations

import time
from functools import lru_cache
from typing import Optional

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError, jwk, jwt
from jose.utils import base64url_decode
from pydantic import BaseModel

from src.config import clerk as clerk_cfg

_bearer = HTTPBearer(auto_error=True)


# ---------------------------------------------------------------------------
# JWKS cache  (refreshed at most once per hour)
# ---------------------------------------------------------------------------
_jwks_cache: dict = {}
_jwks_fetched_at: float = 0.0
_JWKS_TTL = 3600.0


async def _get_jwks() -> dict:
    global _jwks_cache, _jwks_fetched_at
    if time.monotonic() - _jwks_fetched_at < _JWKS_TTL and _jwks_cache:
        return _jwks_cache
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(clerk_cfg.jwks_url)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        _jwks_fetched_at = time.monotonic()
    return _jwks_cache


# ---------------------------------------------------------------------------
# Claims model
# ---------------------------------------------------------------------------
class ClerkClaims(BaseModel):
    user_id: str           # Clerk user_id  (sub)
    session_id: str        # Clerk session id (sid)
    org_id: Optional[str] = None      # set when user is acting inside an org
    org_role: Optional[str] = None    # org:admin | org:member
    email: Optional[str] = None

    @property
    def is_org_admin(self) -> bool:
        return self.org_role == "org:admin"


# ---------------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------------
_ALGORITHMS = ["RS256"]


async def verify_clerk_token(token: str) -> ClerkClaims:
    """Verify a Clerk session JWT and return structured claims."""
    try:
        jwks = await _get_jwks()
        # Decode header to pick the right key
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        matching_key = next(
            (k for k in jwks.get("keys", []) if k.get("kid") == kid), None
        )
        if matching_key is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unknown signing key",
            )

        public_key = jwk.construct(matching_key)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=_ALGORITHMS,
            options={"verify_aud": False},  # Clerk tokens have no aud
        )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        )

    return ClerkClaims(
        user_id=payload["sub"],
        session_id=payload.get("sid", ""),
        org_id=payload.get("org_id"),
        org_role=payload.get("org_role"),
        email=payload.get("email"),
    )


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------
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
