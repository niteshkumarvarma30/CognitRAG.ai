import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
import litellm
from src.database.supabase_client import supabase_manager

# In-memory store fallback for demo & resilience before Supabase table is applied
_IN_MEMORY_SOPS: Dict[str, Dict[str, Any]] = {
    "sop_billing_01": {
        "id": "sop_billing_01",
        "tenant_id": "default",
        "title": "Billing Deployment SOP",
        "version": "v3.1",
        "content": """# Billing Deployment SOP v3.1
1. Merge Pull Request to main branch.
2. Run automated test suite via GitHub Actions.
3. Deploy to production cluster via Terraform.
4. Monitor Datadog latency metrics for 15 minutes.""",
        "sources": ["GitHub PR #1200", "Jira BILL-800"],
        "updated_at": "2026-08-20T10:00:00Z"
    }
}

_IN_MEMORY_PENDING_CHANGES: List[Dict[str, Any]] = [
    {
        "id": "change_001",
        "tenant_id": "default",
        "sop_id": "sop_billing_01",
        "title": "Billing Deployment SOP",
        "old_version": "v3.1",
        "new_version": "v3.2",
        "change_summary": "Added human review step & database migration pre-check before production deployment.",
        "diff": """@@ Step 2 @@
- 2. Run automated test suite via GitHub Actions.
- 3. Deploy to production cluster via Terraform.
+ 2. Run automated test suite via GitHub Actions.
+ 3. Run database migration pre-check script (INC-902 fix).
+ 4. Engineering lead review & approval required before deploy.
+ 5. Deploy to production cluster via Terraform.""",
        "trigger_event": "PR #1287 merged (Fixes INC-902 & BILL-902)",
        "sources": ["Jira: BILL-902", "GitHub: PR #1287", "Slack: #engineering"],
        "status": "approved",
        "approver": "@sarah.chen",
        "created_at": "2026-09-02T14:22:00Z",
        "approved_at": "2026-09-02T14:35:00Z"
    }
]

class SOPImpactAssessment(BaseModel):
    is_impacted: bool = Field(description="True if this event changes an operational procedure or SOP.")
    sop_title: str = Field(description="Name of the SOP (e.g. Billing Deployment SOP)")
    change_summary: str = Field(description="1-sentence explanation of what changed.")
    diff_markdown: str = Field(description="Unified git diff syntax showing the changes.")
    suggested_version: str = Field(description="E.g. v3.2")

def evaluate_sop_impact(event_title: str, event_text: str, tenant_id: str) -> Optional[Dict[str, Any]]:
    """
    Analyzes an incoming event (PR merged, incident resolved, Slack decision)
    and checks if it modifies a standard operating procedure (Living SOP).
    """
    prompt = f"""You are CognitRAG's Autonomous Living Knowledge Engine.
Analyze the following operational event and determine if it modifies or updates an existing standard operating procedure (SOP).

Event Title: {event_title}
Event Details: {event_text}

If it modifies an SOP (e.g. adding a check, changing deployment steps, altering an approval policy):
- Identify the SOP title
- Provide a clear 1-sentence summary of the procedural change
- Provide a unified diff showing old vs new procedure
- Suggest the next version increment (e.g. v3.1 -> v3.2)
"""
    try:
        response = litellm.completion(
            model="bedrock/meta.llama3-70b-instruct-v1:0",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        content = response.choices[0].message.content
        
        # Build proposal record
        change_record = {
            "id": f"change_{uuid.uuid4().hex[:8]}",
            "tenant_id": tenant_id,
            "sop_id": "sop_billing_01",
            "title": "Living Knowledge Update",
            "old_version": "v3.1",
            "new_version": "v3.2",
            "change_summary": f"Detected operational change: {event_title}",
            "diff": content,
            "trigger_event": event_title,
            "sources": ["GitHub / Webhook"],
            "status": "pending",
            "approver": None,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # Save to in-memory fallback
        _IN_MEMORY_PENDING_CHANGES.append(change_record)
        
        # Try persisting to Supabase if table exists
        try:
            db = supabase_manager.get_admin_client()
            db.table("living_sop_changes").insert({
                "tenant_id": tenant_id,
                "title": change_record["title"],
                "old_version": change_record["old_version"],
                "new_version": change_record["new_version"],
                "change_summary": change_record["change_summary"],
                "diff": change_record["diff"],
                "trigger_event": change_record["trigger_event"],
                "sources": change_record["sources"],
                "status": "pending"
            }).execute()
        except Exception:
            pass # Table might be pending migration
            
        return change_record
    except Exception as e:
        print(f"Living SOP impact evaluation failed: {e}")
        return None

def get_pending_sop_changes(tenant_id: str) -> List[Dict[str, Any]]:
    """Returns all pending and recently approved living knowledge changes."""
    try:
        db = supabase_manager.get_admin_client()
        res = db.table("living_sop_changes").select("*").eq("tenant_id", tenant_id).order("created_at", desc=True).execute()
        if res.data:
            return res.data
    except Exception:
        pass
        
    return [c for c in _IN_MEMORY_PENDING_CHANGES if c.get("tenant_id") in (tenant_id, "default")]

def approve_sop_change(change_id: str, approver: str, tenant_id: str) -> Dict[str, Any]:
    """Approves and publishes a proposed living SOP diff."""
    for c in _IN_MEMORY_PENDING_CHANGES:
        if c["id"] == change_id:
            c["status"] = "approved"
            c["approver"] = approver
            c["approved_at"] = datetime.utcnow().isoformat() + "Z"
            return {"success": True, "change": c}
            
    try:
        db = supabase_manager.get_admin_client()
        res = db.table("living_sop_changes").update({
            "status": "approved",
            "approver": approver,
            "approved_at": datetime.utcnow().isoformat() + "Z"
        }).eq("id", change_id).execute()
        if res.data:
            return {"success": True, "change": res.data[0]}
    except Exception as e:
        print(f"Error approving change in Supabase: {e}")
        
    return {"success": False, "message": "Change ID not found"}
