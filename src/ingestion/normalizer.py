"""
CognitRAG v2 — Normalized Ingestion Object
Every connector (Slack, GitHub, Jira, Notion, Drive, Meeting) maps its
raw data to this standard schema before anything else runs.
"""
import uuid
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from typing import Optional

VALID_SOURCE_TYPES = {
    "github", "slack", "jira", "notion", "drive",
    "meeting_zoom", "meeting_meet", "meeting_teams", "pdf", "manual"
}
VALID_LANGUAGE_TAGS = {"en", "hi-latn", "mixed"}


class NormalizedDoc(BaseModel):
    """The standard ingestion object — all connectors map to this."""
    doc_id:           str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id:        str
    source_type:      str   # github | slack | jira | notion | drive | meeting_* | pdf
    source_native_id: str   # PR number, message ts, page_id, meeting_id, filename
    content:          str   # normalized markdown text
    language_tag:     str = "en"   # en | hi-latn | mixed
    author:           str = "Unknown"
    timestamp:        str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    raw_ref_url:      Optional[str] = None   # deep link back to original source
    filename:         Optional[str] = None   # for PDF/file uploads

    def validate_source_type(self):
        if self.source_type not in VALID_SOURCE_TYPES:
            raise ValueError(f"Invalid source_type: {self.source_type}. Must be one of {VALID_SOURCE_TYPES}")

    def validate_language_tag(self):
        if self.language_tag not in VALID_LANGUAGE_TAGS:
            self.language_tag = "en"  # safe fallback


def build_slack_doc(tenant_id: str, channel_id: str, channel_name: str,
                    message_ts: str, user_name: str, text: str,
                    language_tag: str = "en",
                    workspace_url: str = "") -> NormalizedDoc:
    """Build a NormalizedDoc from a Slack message."""
    raw_ref_url = f"{workspace_url}/archives/{channel_id}/p{message_ts.replace('.','')}" if workspace_url else None
    return NormalizedDoc(
        tenant_id=tenant_id,
        source_type="slack",
        source_native_id=f"{channel_id}:{message_ts}",
        content=f"Slack #{channel_name}\nAuthor: {user_name}\n\n{text}",
        language_tag=language_tag,
        author=user_name,
        raw_ref_url=raw_ref_url,
        filename=f"slack_{channel_name}_{message_ts}"
    )


def build_github_doc(tenant_id: str, repo: str, pr_number: int,
                     title: str, body: str, author: str,
                     created_at: str) -> NormalizedDoc:
    """Build a NormalizedDoc from a GitHub PR or Issue."""
    return NormalizedDoc(
        tenant_id=tenant_id,
        source_type="github",
        source_native_id=f"{repo}#PR{pr_number}",
        content=f"GitHub PR #{pr_number}: {title}\nRepo: {repo}\nAuthor: {author}\n\n{body}",
        language_tag="en",  # GitHub content is always English
        author=author,
        timestamp=created_at,
        raw_ref_url=f"https://github.com/{repo}/pull/{pr_number}",
        filename=f"pr_{repo.replace('/','_')}_{pr_number}"
    )


def build_jira_doc(tenant_id: str, issue_key: str, summary: str,
                   description: str, reporter: str, created: str,
                   jira_base_url: str = "") -> NormalizedDoc:
    """Build a NormalizedDoc from a Jira issue."""
    return NormalizedDoc(
        tenant_id=tenant_id,
        source_type="jira",
        source_native_id=issue_key,
        content=f"Jira {issue_key}: {summary}\nReporter: {reporter}\n\n{description}",
        language_tag="en",
        author=reporter,
        timestamp=created,
        raw_ref_url=f"{jira_base_url}/browse/{issue_key}" if jira_base_url else None,
        filename=f"jira_{issue_key}"
    )


def build_notion_doc(tenant_id: str, page_id: str, title: str,
                     content: str, author: str, created_time: str) -> NormalizedDoc:
    """Build a NormalizedDoc from a Notion page."""
    return NormalizedDoc(
        tenant_id=tenant_id,
        source_type="notion",
        source_native_id=page_id,
        content=f"# {title}\n\n{content}",
        language_tag="en",
        author=author,
        timestamp=created_time,
        raw_ref_url=f"https://notion.so/{page_id.replace('-','')}",
        filename=f"notion_{page_id}"
    )


def build_meeting_doc(tenant_id: str, meeting_id: str, platform: str,
                      transcript: str, participants: list,
                      started_at: str, language_tag: str = "hi-latn") -> NormalizedDoc:
    """Build a NormalizedDoc from a meeting transcript (Zoom/Meet/Teams)."""
    source_type = f"meeting_{platform.lower()}"  # meeting_zoom, meeting_meet, meeting_teams
    authors = ", ".join(participants) if participants else "Unknown"
    return NormalizedDoc(
        tenant_id=tenant_id,
        source_type=source_type,
        source_native_id=meeting_id,
        content=f"Meeting Transcript ({platform})\nParticipants: {authors}\n\n{transcript}",
        language_tag=language_tag,
        author=authors,
        timestamp=started_at,
        filename=f"meeting_{platform}_{meeting_id}"
    )


def build_pdf_doc(tenant_id: str, filename: str, content: str,
                  author: str = "Unknown") -> NormalizedDoc:
    """Build a NormalizedDoc from an uploaded PDF."""
    return NormalizedDoc(
        tenant_id=tenant_id,
        source_type="pdf",
        source_native_id=filename,
        content=content,
        language_tag="en",
        author=author,
        filename=filename
    )
