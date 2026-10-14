"""
Tenant resolver — maps a Clerk identity to a CognitRAG tenant row.

Solo  → tenant identified by owner_user_id = claims.user_id
Teams → tenant identified by clerk_org_id  = claims.org_id

The resolved tenant (including plan) is attached to every RequestContext so
that every downstream call knows which plan limits and permission rules apply.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional

from fastapi import Depends, HTTPException, status

from src.auth.clerk import ClerkClaims, get_clerk_claims
from src.database.supabase_client import get_supabase

Plan = Literal["free", "solo", "teams", "enterprise"]


@dataclass(frozen=True)
class ResolvedTenant:
    tenant_id: str
    plan: Plan
    owner_user_id: Optional[str]    # set for Solo
    clerk_org_id: Optional[str]     # set for Teams / Enterprise

    @property
    def is_teams(self) -> bool:
        return self.plan in ("teams", "enterprise")

    @property
    def is_solo(self) -> bool:
        return self.plan == "solo"


async def resolve_tenant(claims: ClerkClaims) -> ResolvedTenant:
    """
    Look up the tenant row for the authenticated user.

    Priority:
      1. If the Clerk token carries an org_id  → Teams tenant
      2. Otherwise                              → Solo tenant (owner_user_id)

    Raises 403 if no matching tenant exists — the user has not completed
    onboarding or has been removed from the workspace.
    """
    supa = get_supabase()

    if claims.org_id:
        # Teams / Enterprise path
        resp = (
            supa.table("tenants")
            .select("id, plan, owner_user_id, clerk_org_id")
            .eq("clerk_org_id", claims.org_id)
            .single()
            .execute()
        )
    else:
        # Solo path
        resp = (
            supa.table("tenants")
            .select("id, plan, owner_user_id, clerk_org_id")
            .eq("owner_user_id", claims.user_id)
            .single()
            .execute()
        )

    row = resp.data if resp.data else None
    if not row:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No CognitRAG workspace found for this identity. "
                   "Complete onboarding first.",
        )

    return ResolvedTenant(
        tenant_id=row["id"],
        plan=row.get("plan", "free"),
        owner_user_id=row.get("owner_user_id"),
        clerk_org_id=row.get("clerk_org_id"),
    )


# ---------------------------------------------------------------------------
# FastAPI dependency  (chains Clerk verification → tenant lookup)
# ---------------------------------------------------------------------------
async def get_tenant(
    claims: ClerkClaims = Depends(get_clerk_claims),
) -> ResolvedTenant:
    return await resolve_tenant(claims)
