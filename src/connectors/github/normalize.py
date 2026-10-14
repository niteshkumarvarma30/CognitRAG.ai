"""
GitHub Data Normalizer — converts raw GitHub API payloads (Issues, PRs, Comments)
into standard NormalizedDocument instances.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from src.connectors.base import NormalizedDocument


def parse_iso_datetime(dt_str: Optional[str]) -> Optional[datetime]:
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except Exception:
        return None


def normalize_github_issue_or_pr(
    repo_full_name: str,
    item: Dict[str, Any],
    is_private: bool = False
) -> NormalizedDocument:
    """Normalize a GitHub Issue or Pull Request."""
    number = item.get("number")
    is_pr = "pull_request" in item
    kind = "Pull Request" if is_pr else "Issue"
    title = item.get("title", f"Untitled {kind}")
    body = item.get("body") or ""
    author = (item.get("user") or {}).get("login", "unknown")
    html_url = item.get("html_url", "")
    created_at = parse_iso_datetime(item.get("created_at"))
    
    # Permission token format: 'github_repo:<owner>/<repo>'
    # If the repo is public, also append 'public' so any tenant member can see it
    tokens = [f"github_repo:{repo_full_name.lower()}"]
    if not is_private:
        tokens.append("public")

    content = f"[{kind} #{number}] {title}\nAuthor: @{author}\nURL: {html_url}\nState: {item.get('state', 'open')}\n\n{body}"

    return NormalizedDocument(
        source_type="github",
        source_native_id=f"{repo_full_name}#{number}",
        title=f"[{repo_full_name}] #{number}: {title}",
        content=content.strip(),
        author=author,
        raw_ref_url=html_url,
        source_timestamp=created_at,
        allowed_entities=tokens,
        metadata={
            "repo": repo_full_name,
            "number": number,
            "is_pr": is_pr,
            "html_url": html_url,
            "state": item.get("state"),
        }
    )


def normalize_github_comment(
    repo_full_name: str,
    parent_number: int,
    comment: Dict[str, Any],
    is_private: bool = False
) -> NormalizedDocument:
    """Normalize a comment on an Issue or PR."""
    comment_id = comment.get("id")
    body = comment.get("body") or ""
    author = (comment.get("user") or {}).get("login", "unknown")
    html_url = comment.get("html_url", "")
    created_at = parse_iso_datetime(comment.get("created_at"))

    tokens = [f"github_repo:{repo_full_name.lower()}"]
    if not is_private:
        tokens.append("public")

    content = f"Comment on {repo_full_name} #{parent_number} by @{author}:\n\n{body}"

    return NormalizedDocument(
        source_type="github",
        source_native_id=f"{repo_full_name}#comment-{comment_id}",
        parent_id=f"{repo_full_name}#{parent_number}",
        title=f"Comment on {repo_full_name} #{parent_number} by @{author}",
        content=content.strip(),
        author=author,
        raw_ref_url=html_url,
        source_timestamp=created_at,
        allowed_entities=tokens,
        metadata={
            "repo": repo_full_name,
            "parent_number": parent_number,
            "comment_id": comment_id,
            "html_url": html_url,
        }
    )
