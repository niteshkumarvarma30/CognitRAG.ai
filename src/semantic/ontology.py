"""
Semantic Dictionary (Ontology Store)
=====================================
Fetches admin-governed business definitions from Supabase and injects them
into retrieval or LLM context to prevent hallucinated definitions.
"""
from src.database.supabase_client import supabase_manager


def fetch_semantic_definitions(tenant_id: str, question: str) -> str:
    """
    Searches semantic_definitions for terms appearing in the question.
    Returns formatted string of governed definitions.
    """
    try:
        db = supabase_manager.get_admin_client()
        result = db.table("semantic_definitions") \
            .select("term, definition, owner, scope, version") \
            .eq("tenant_id", tenant_id) \
            .execute()

        if not result.data:
            return ""

        question_lower = question.lower()
        matched = []
        for row in result.data:
            if row["term"].lower() in question_lower:
                owner_tag = f" [{row['owner']}]" if row.get("owner") else ""
                scope_tag = f" (scope: {row['scope']})" if row.get("scope") else ""
                matched.append(f"  - {row['term'].upper()}{owner_tag}{scope_tag}: {row['definition']}")

        if not matched:
            return ""

        return "\n\nGOVERNED DEFINITIONS:\n" + "\n".join(matched)
    except Exception as e:
        print(f"[Semantic Dictionary] Failed to fetch definitions: {e}")
        return ""


def expand_query_semantically(tenant_id: str, question: str) -> str:
    """
    Expands question with definitions of matching acronyms/terms.
    """
    try:
        db = supabase_manager.get_admin_client()
        result = db.table("semantic_definitions") \
            .select("term, definition") \
            .eq("tenant_id", tenant_id) \
            .execute()

        if not result.data:
            return question

        expanded = question
        question_lower = question.lower()
        for row in result.data:
            term = row["term"].lower()
            if term in question_lower:
                expanded += f" ({row['term'].upper()}: {row['definition']})"

        return expanded
    except Exception as e:
        return question


def get_all_definitions(tenant_id: str) -> list:
    """Returns all semantic definitions for a tenant."""
    try:
        db = supabase_manager.get_admin_client()
        result = db.table("semantic_definitions") \
            .select("*") \
            .eq("tenant_id", tenant_id) \
            .order("created_at", desc=True) \
            .execute()
        return result.data or []
    except Exception as e:
        return []


def upsert_definition(tenant_id: str, term: str, definition: str,
                      owner: str = None, scope: str = None) -> dict:
    """Creates or updates a governed definition."""
    try:
        db = supabase_manager.get_admin_client()
        result = db.table("semantic_definitions").upsert({
            "tenant_id": tenant_id,
            "term": term.lower().strip(),
            "definition": definition.strip(),
            "owner": owner,
            "scope": scope,
        }, on_conflict="tenant_id,term").execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        print(f"[Semantic Dictionary] Failed to upsert definition: {e}")
        raise


def delete_definition(tenant_id: str, definition_id: str) -> bool:
    """Deletes a governed definition by its UUID."""
    try:
        db = supabase_manager.get_admin_client()
        db.table("semantic_definitions") \
            .delete() \
            .eq("tenant_id", tenant_id) \
            .eq("id", definition_id) \
            .execute()
        return True
    except Exception as e:
        return False
