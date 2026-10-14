"""
CognitRAG v5 — Central configuration.

All environment variables are loaded HERE and nowhere else.
Import from this module; never call os.environ or dotenv in other files.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Load .env once at import time (harmless if already loaded)
# ---------------------------------------------------------------------------
_project_root = Path(__file__).resolve().parent.parent
load_dotenv(_project_root / ".env", override=False)


def _require(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        raise RuntimeError(
            f"Required environment variable '{key}' is not set. "
            "Check your .env file."
        )
    return value


def _get(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
class DatabaseConfig:
    # asyncpg hot-path (transaction-mode pooler — no session-level state)
    pooler_url: str = _get("DATABASE_POOLER_URL")
    # Supabase Python client (service role — all CRUD, RLS bypass)
    supabase_url: str = _require("SUPABASE_URL")
    service_role_key: str = _require("SUPABASE_SERVICE_ROLE_KEY")
    jwt_secret: str = _get("SUPABASE_JWT_SECRET")

    # Neo4j
    neo4j_uri: str = _get("NEO4J_URI")
    neo4j_user: str = _get("NEO4J_USERNAME", "neo4j")
    neo4j_password: str = _get("NEO4J_PASSWORD")

    # Redis (cache + job queue)
    redis_url: str = _get("REDIS_URL", "redis://localhost:6379/0")

    # Embedding dimension choices (one must be active)
    # 1024 → AWS Bedrock Titan v2 / Jina
    # 768  → Google Vertex AI text-embedding-004 (primary for GFS credits)
    embedding_dim: int = int(_get("EMBEDDING_DIM", "768"))


# ---------------------------------------------------------------------------
# Google Cloud / Vertex AI  (primary LLM + embeddings via GFS $2 000 credits)
# ---------------------------------------------------------------------------
class VertexConfig:
    project_id: str = _get("GCP_PROJECT_ID", "neon-rampart-475915-m4")
    location: str = _get("GCP_LOCATION", "us-central1")
    # Point GOOGLE_APPLICATION_CREDENTIALS to the service-account JSON.
    credentials_file: str = _get(
        "GOOGLE_APPLICATION_CREDENTIALS",
        "config/neon-rampart-475915-m4-7361322a43ed.json",
    )
    chat_model: str = _get("VERTEX_MODEL", "gemini-2.5-flash")
    embedding_model: str = _get("VERTEX_EMBEDDING_MODEL", "text-embedding-004")


# ---------------------------------------------------------------------------
# AWS Bedrock  (fallback embeddings — Titan Embed v2, 1024-dim)
# ---------------------------------------------------------------------------
class BedrockConfig:
    access_key_id: str = _get("AWS_ACCESS_KEY_ID")
    secret_access_key: str = _get("AWS_SECRET_ACCESS_KEY")
    region: str = _get("AWS_REGION_NAME", "us-east-1")
    embedding_model: str = _get(
        "BEDROCK_EMBEDDING_MODEL",
        "amazon.titan-embed-text-v2:0",
    )


# ---------------------------------------------------------------------------
# Auth — Clerk
# ---------------------------------------------------------------------------
class ClerkConfig:
    secret_key: str = _require("CLERK_SECRET_KEY")
    webhook_secret: str = _get("CLERK_WEBHOOK_SECRET")
    # JWKS endpoint — auto-derived from publishable key domain
    jwks_url: str = _get(
        "CLERK_JWKS_URL",
        "https://api.clerk.com/v1/jwks",
    )


# ---------------------------------------------------------------------------
# Connectors
# ---------------------------------------------------------------------------
class SlackConfig:
    client_id: str = _get("SLACK_CLIENT_ID")
    client_secret: str = _get("SLACK_CLIENT_SECRET")
    signing_secret: str = _get("SLACK_SIGNING_SECRET")
    bot_token: str = _get("SLACK_BOT_TOKEN")  # workspace-level fallback


class GitHubConfig:
    app_id: str = _get("GITHUB_APP_ID")
    private_key: str = _get("GITHUB_PRIVATE_KEY")   # PEM content, not path
    webhook_secret: str = _get("GITHUB_WEBHOOK_SECRET")
    client_id: str = _get("GITHUB_CLIENT_ID")
    client_secret: str = _get("GITHUB_CLIENT_SECRET")


class AtlassianConfig:
    client_id: str = _get("ATLASSIAN_CLIENT_ID")
    client_secret: str = _get("ATLASSIAN_CLIENT_SECRET")
    # Jira webhook registrations expire after 30 days; refresh_job handles this.
    webhook_ttl_days: int = int(_get("JIRA_WEBHOOK_TTL_DAYS", "25"))


class NotionConfig:
    client_id: str = _get("NOTION_CLIENT_ID")
    client_secret: str = _get("NOTION_CLIENT_SECRET")


# ---------------------------------------------------------------------------
# Observability
# ---------------------------------------------------------------------------
class ObservabilityConfig:
    langchain_tracing: bool = _get("LANGCHAIN_TRACING_V2", "false").lower() == "true"
    langchain_api_key: str = _get("LANGCHAIN_API_KEY")
    langchain_project: str = _get("LANGCHAIN_PROJECT", "cognitrag_v5")


# ---------------------------------------------------------------------------
# Third-party
# ---------------------------------------------------------------------------
class SarvamConfig:
    api_key: str = _get("SARVAM_API_KEY")   # translation only


class JinaConfig:
    api_key: str = _get("JINA_API_KEY")     # reranker


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
class AppConfig:
    env: str = _get("APP_ENV", "development")      # development | staging | production
    api_url: str = _get("API_URL", "http://localhost:8000")
    log_level: str = _get("LOG_LEVEL", "INFO")
    cors_origins: list[str] = [
        o.strip()
        for o in _get("CORS_ORIGINS", "http://localhost:3000").split(",")
        if o.strip()
    ]

    # Solo plan limits
    solo_max_docs: int = int(_get("SOLO_MAX_DOCS", "500"))
    solo_max_members: int = 1

    # Teams plan limits
    teams_max_docs: int = int(_get("TEAMS_MAX_DOCS", "50000"))
    teams_max_members: int = int(_get("TEAMS_MAX_MEMBERS", "500"))

    # Cache TTL
    permission_cache_ttl_s: int = int(_get("PERMISSION_CACHE_TTL_S", "300"))
    semantic_cache_ttl_s: int = int(_get("SEMANTIC_CACHE_TTL_S", "3600"))


# ---------------------------------------------------------------------------
# Convenience singletons — import these directly
# ---------------------------------------------------------------------------
db = DatabaseConfig()
vertex = VertexConfig()
bedrock = BedrockConfig()
clerk = ClerkConfig()
slack = SlackConfig()
github = GitHubConfig()
atlassian = AtlassianConfig()
notion = NotionConfig()
observability = ObservabilityConfig()
sarvam = SarvamConfig()
jina = JinaConfig()
app = AppConfig()
