import pytest
from src.ingestion.cross_linker import extract_cross_system_references
from src.knowledge.living_sop import get_pending_sop_changes, approve_sop_change, _IN_MEMORY_PENDING_CHANGES

def test_cross_system_reference_extraction():
    sample_text = """
    PR #1287 merged by @sarah.chen fixes critical billing timeout in BILL-902.
    Follow-up discussed in #engineering and logged under incident INC-902.
    """
    refs = extract_cross_system_references(sample_text)
    assert "BILL-902" in refs["jira"]
    assert "1287" in refs["prs"]
    assert "engineering" in refs["slack_channels"]
    assert "INC-902" in refs["incidents"]

def test_living_knowledge_state_machine():
    # Test pending SOP listing
    changes = get_pending_sop_changes("default")
    assert len(changes) > 0
    assert any(c["id"] == "change_001" for c in changes)

    # Test adding and approving a new change
    test_change = {
        "id": "change_test_999",
        "tenant_id": "test_tenant",
        "sop_id": "sop_billing_01",
        "title": "Payment API SOP",
        "old_version": "v1.0",
        "new_version": "v1.1",
        "change_summary": "Added idempotency key check",
        "diff": "+ Check idempotency key before charge",
        "trigger_event": "PR #1300",
        "sources": ["GitHub PR #1300"],
        "status": "pending",
        "approver": None
    }
    _IN_MEMORY_PENDING_CHANGES.append(test_change)

    # Approve the change
    res = approve_sop_change("change_test_999", "@lead_architect", "test_tenant")
    assert res["success"] is True
    assert res["change"]["status"] == "approved"
    assert res["change"]["approver"] == "@lead_architect"

def test_evidence_receipt_structure_in_chat():
    with open("src/retrieval/nodes.py", "r", encoding="utf-8") as f:
        content = f.read()
    assert '"evidence": evidence' in content
    assert '"type": source_type' in content

def test_mcp_server_signature():
    from src.mcp.server import search_company_knowledge
    import inspect
    sig = inspect.signature(search_company_knowledge)
    assert "user_permissions" in sig.parameters
    assert "tenant_id" in sig.parameters

def test_routes_has_webhooks_and_sops():
    import ast
    with open("src/api/routes.py", "r", encoding="utf-8") as f:
        content = f.read()
    
    assert "/api/v1/webhooks/github" in content
    assert "/api/v1/webhooks/slack" in content
    assert "/api/v1/sops/pending" in content
    assert "/api/v1/sops/approve" in content
