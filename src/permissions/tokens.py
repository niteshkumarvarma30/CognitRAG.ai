"""
Permission Tokens — Resolution, caching, and hashing for CognitRAG v5.

Tokens follow standard format:
- 'public': Accessible by all members of the tenant (legacy manual uploads, public docs)
- '<source_type>:<source_native_id>': e.g. 'slack_channel:C123', 'jira_project:PAY', 'github_repo:acme/api', 'notion_page:<id>'

Tokens are loaded via the database function `get_user_permission_tokens(tenant_id, user_id)`.
"""

from __future__ import annotations

import hashlib
import json
import logging
from typing import Sequence
import redis.asyncio as redis

from src.config import db as db_cfg, app as app_cfg
from src.database.supabase_client import get_supabase

logger = logging.getLogger(__name__)

_redis_client: redis.Redis | None = None


def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(db_cfg.redis_url, decode_responses=True)
    return _redis_client


def compute_permission_hash(tokens: Sequence[str]) -> str:
    """Compute sha256 of sorted unique tokens."""
    sorted_unique = sorted(set(tokens))
    return hashlib.sha256(",".join(sorted_unique).encode("utf-8")).hexdigest()


async def get_user_permission_tokens(
    tenant_id: str,
    user_id: str,
    use_cache: bool = True
) -> list[str]:
    """
    Retrieve permission tokens for a given tenant and user.
    Uses Redis cache when available, falling back to database RPC `get_user_permission_tokens`.
    Fails closed: if user is not a valid member or error occurs, returns empty list.
    """
    cache_key = f"perm:{tenant_id}:{user_id}"
    r = None
    
    if use_cache:
        try:
            r = get_redis()
            cached = await r.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            logger.warning(f"Permission cache read failed: {e}")

    # Fallback to database RPC
    try:
        supa = get_supabase()
        resp = supa.rpc(
            "get_user_permission_tokens",
            {"p_tenant_id": tenant_id, "p_user_id": user_id}
        ).execute()

        tokens: list[str] = resp.data or []
        
        # Save to Redis
        if use_cache and r is not None:
            try:
                await r.setex(cache_key, app_cfg.permission_cache_ttl_s, json.dumps(tokens))
            except Exception as e:
                logger.warning(f"Permission cache write failed: {e}")

        return tokens
    except Exception as exc:
        logger.error(f"Failed to fetch permission tokens for user {user_id} in tenant {tenant_id}: {exc}")
        return []


async def invalidate_user_permissions(tenant_id: str, user_id: str) -> None:
    """Invalidate cached permission tokens when workspace membership or grants change."""
    try:
        r = get_redis()
        cache_key = f"perm:{tenant_id}:{user_id}"
        await r.delete(cache_key)
    except Exception as e:
        logger.warning(f"Failed to invalidate cache key for user {user_id}: {e}")
