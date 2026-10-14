"""
RequestContext — Central execution context for every pipeline call in CognitRAG v5.

Carries authenticated tenant, user identity, plan, surface, and permission tokens
down the entire chain (retrieval, cache, citations, audit logging, ingestion).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal, Optional, Sequence
import hashlib

SurfaceType = Literal["web", "slack", "github"]
PlanType = Literal["free", "solo", "teams", "enterprise"]


@dataclass(frozen=True)
class RequestContext:
    tenant_id: str
    user_id: str
    plan: PlanType
    surface: SurfaceType = "web"
    is_admin: bool = False
    clerk_org_id: Optional[str] = None
    permission_tokens: tuple[str, ...] = field(default_factory=tuple)
    
    # Optional context info for multi-turn / multi-surface requests
    conversation_id: Optional[str] = None
    session_id: Optional[str] = None
    external_user_id: Optional[str] = None  # Slack user ID or GitHub username/ID

    @property
    def permission_hash(self) -> str:
        """
        Deterministic SHA-256 hash of sorted permission tokens.
        Used to namespace semantic cache and verify audience matches.
        """
        sorted_tokens = sorted(self.permission_tokens)
        token_str = ",".join(sorted_tokens)
        return hashlib.sha256(token_str.encode("utf-8")).hexdigest()

    @property
    def has_permissions(self) -> bool:
        """True if the user holds at least one permission token."""
        return len(self.permission_tokens) > 0

    @property
    def is_teams(self) -> bool:
        return self.plan in ("teams", "enterprise")

    @property
    def is_solo(self) -> bool:
        return self.plan == "solo"
