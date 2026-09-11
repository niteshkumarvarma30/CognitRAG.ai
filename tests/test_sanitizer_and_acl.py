import pytest
from src.utils.sanitizer import sanitize_text

def test_stripe_key_redaction():
    text = "Deploying with Stripe secret sk_live_51M0abcdefghijklmnopqrstuv and public key pk_live_51M0abcdefghijklmnopqrstuv"
    sanitized = sanitize_text(text)
    assert "sk_live_" not in sanitized
    assert "[REDACTED_STRIPE_KEY]" in sanitized
    assert "[REDACTED_STRIPE_PUBLIC_KEY]" in sanitized

def test_github_token_redaction():
    text = "Clone repo using token ghp_1234567890abcdefghijklmnopqrstuvwx into CI"
    sanitized = sanitize_text(text)
    assert "ghp_" not in sanitized
    assert "[REDACTED_GITHUB_PAT]" in sanitized

def test_aws_key_redaction():
    text = "Access S3 bucket with AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE for backups"
    sanitized = sanitize_text(text)
    assert "AKIAIOSFODNN7EXAMPLE" not in sanitized
    assert "[REDACTED_AWS_KEY_ID]" in sanitized

def test_password_and_bearer_redaction():
    text = "Connecting with Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and password = SuperSecretPassword123!"
    sanitized = sanitize_text(text)
    assert "SuperSecretPassword123!" not in sanitized
    assert "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" not in sanitized
    assert "[REDACTED_PASSWORD]" in sanitized
    assert "[REDACTED_BEARER_TOKEN]" in sanitized

def test_normal_text_preservation():
    text = "Billing service migration scheduled for Friday at 11:00 PM UTC following incident INC-902."
    sanitized = sanitize_text(text)
    assert sanitized == text

def test_allowed_entities_default_in_pipeline():
    import ast
    with open("src/ingestion/pipeline.py", "r", encoding="utf-8") as f:
        tree = ast.parse(f.read())
    
    found = False
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == "process_parent_chunk":
            args = [a.arg for a in node.args.args]
            assert "allowed_entities" in args
            found = True
            break
    assert found, "process_parent_chunk not found in pipeline.py"

def test_hybrid_retriever_signature_includes_user_permissions():
    import ast
    with open("src/retrieval/hybrid.py", "r", encoding="utf-8") as f:
        tree = ast.parse(f.read())
    
    checked = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name in ("hybrid_retriever", "vector_search", "keyword_search"):
            args = [a.arg for a in node.args.args]
            checked[node.name] = "user_permissions" in args
            
    assert checked.get("hybrid_retriever") is True
    assert checked.get("vector_search") is True
    assert checked.get("keyword_search") is True
