"""
Connector Protocol and Base Interface for CognitRAG v5.

All 4 supported connectors (Slack, GitHub, Jira, Notion) implement this interface.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, AsyncIterator, Dict, List, Optional, Protocol, runtime_checkable


@dataclass
class NormalizedDocument:
    source_type: str                   # 'slack' | 'github' | 'jira' | 'notion'
    source_native_id: str              # Unique id in external tool
    title: str
    content: str
    author: Optional[str] = None
    raw_ref_url: Optional[str] = None
    source_timestamp: Optional[datetime] = None
    language_tag: Optional[str] = "en"  # 'en' | 'hi-latn' | 'mixed'
    allowed_entities: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    parent_id: Optional[str] = None


@dataclass
class SyncBatchResult:
    items: List[NormalizedDocument]
    next_cursor: Optional[Dict[str, Any]] = None
    has_more: bool = False
    estimated_total: Optional[int] = None


@dataclass
class AccessGrant:
    source_type: str
    source_native_id: str
    display_name: str
    is_private: bool
    allowed_member_ids: List[str]      # external user IDs or CognitRAG user IDs
    audience_mode: str = "mirrored"    # 'mirrored' | 'admin_set'


@runtime_checkable
class Connector(Protocol):
    """Protocol that every CognitRAG connector must adhere to."""

    @property
    def provider_name(self) -> str:
        """slack | github | jira | notion"""
        ...

    async def validate_connection(self, tenant_id: str, credentials: Dict[str, Any]) -> bool:
        """Verify that token / app credentials are still active and valid."""
        ...

    async def fetch_fast_pass(
        self, tenant_id: str, limit: int = 50
    ) -> SyncBatchResult:
        """
        Fast pass onboarding: fetch recent and critical documents quickly
        so the workspace can be used immediately within 60 seconds.
        """
        ...

    async def fetch_backfill(
        self, tenant_id: str, cursor: Optional[Dict[str, Any]] = None, limit: int = 100
    ) -> SyncBatchResult:
        """
        Background full history backfill. Supports resumable cursor pagination.
        """
        ...

    async def fetch_incremental(
        self, tenant_id: str, since: datetime
    ) -> SyncBatchResult:
        """Poll or delta fetch changes since last successful sync."""
        ...

    async def fetch_access_grants(
        self, tenant_id: str
    ) -> List[AccessGrant]:
        """Fetch permission containers (channels, repositories, projects, pages) and member access lists."""
        ...

    async def handle_webhook(
        self, tenant_id: str, event_type: str, payload: Dict[str, Any]
    ) -> Optional[NormalizedDocument]:
        """Process incoming real-time change event."""
        ...

    def build_deep_link(self, raw_ref_url: str, metadata: Dict[str, Any]) -> str:
        """Construct user-navigable web URL or deep app URL to the original entity."""
        ...
