"""
Semantic Dictionary (Ontology Store)
=====================================
Fetches admin-governed business definitions from Supabase and injects them
into the LLM system prompt BEFORE answer generation. This prevents the LLM
from hallucinating or guessing definitions of company-specific metrics and
ensures every agent answer is deterministic and auditable.
"""
import os
from src.database.supabase_client import supabase_manager


def fetch_semantic_definitions(tenant_id: str, question: str) -> str:
    """
    Searches the semantic_definitions table for any governed terms that
    appear in the user's question, and returns them formatted as a
    GOVERNED DEFINITIONS block ready to inject into the LLM system prompt.

    Args:
        tenant_id: The tenant UUID to scope the search.
        question: The user's raw question text.

    Returns:
        A formatted string of relevant governed definitions, or "" if none found.
    """
    try:
        db = supabase_manager.get_admin_client()
        # Fetch all definitions for this tenant
        result = db.table("semantic_definitions") \
            .select("term, definition, owner, scope, version") \
            .eq("tenant_id", tenant_id) \
            .execute()

        if not result.data:
            return ""

        question_lower = question.lower()
        matched = []

        for row in result.data:
            # Case-insensitive check: does the term appear in the question?
            if row["term"].lower() in question_lower:
                owner_tag = f" [{row['owner']}]" if row.get("owner") else ""
                scope_tag = f" (scope: {row['scope']})" if row.get("scope") else ""
                version_tag = f" v{row['version']}" if row.get("version") else ""
                matched.append(
                    f"  - {row['term'].upper()}{owner_tag}{scope_tag}{version_tag}: "
                    f"{row['definition']}"
                )

        if not matched:
            return ""

        definitions_block = (
            "\n\nGOVERNED DEFINITIONS (You MUST use these exact definitions. "
            "Never calculate or define these terms yourself):\n"
            + "\n".join(matched)
        )
        print(f"[Semantic Dictionary] Injecting {len(matched)} governed definition(s).")
        return definitions_block

    except Exception as e:
        print(f"[Semantic Dictionary] Failed to fetch definitions: {e}")
        return ""

def expand_query_semantically(tenant_id: str, question: str) -> str:
    """
    Acts as a universal translation layer. It scans the raw question for internal 
    jargon or acronyms (e.g. 'MAU') and physically expands the query string 
    (e.g. 'MAU (Monthly Active Users)') BEFORE it is embedded for vector search.
    This guarantees that the embeddings capture the true meaning of the jargon,
    drastically improving recall.
    """
    try:
        db = supabase_manager.get_admin_client()
        result = db.table("semantic_definitions") \
            .select("term, definition") \
            .eq("tenant_id", tenant_id) \
            .execute()

        if not result.data:
            return question

        expanded_question = question
        question_lower = question.lower()
        
        for row in result.data:
            term = row["term"].lower()
            # If the jargon exists in the question, append its definition in parentheses
            if term in question_lower:
                # We do a naive text append to the query so the embedding model sees both
                # the acronym and the explicit meaning.
                # E.g., "What is the MAU?" -> "What is the MAU? (MAU means: Monthly Active Users...)"
                expanded_question += f" ({row['term'].upper()} means: {row['definition']})"
                
        if expanded_question != question:
            print(f"[Semantic Ontology] Expanded Query: {expanded_question}")
            
        return expanded_question

    except Exception as e:
        print(f"[Semantic Ontology] Expansion failed: {e}")
        return question



def get_all_definitions(tenant_id: str) -> list:
    """Returns all semantic definitions for a tenant (used by the admin API)."""
    try:
        db = supabase_manager.get_admin_client()
        result = db.table("semantic_definitions") \
            .select("*") \
            .eq("tenant_id", tenant_id) \
            .order("created_at", desc=True) \
            .execute()
        return result.data or []
    except Exception as e:
        print(f"[Semantic Dictionary] Failed to get all definitions: {e}")
        return []


def upsert_definition(tenant_id: str, term: str, definition: str,
                      owner: str = None, scope: str = None) -> dict:
    """Creates or updates a governed definition for a tenant."""
    try:
        db = supabase_manager.get_admin_client()

        # Check if it already exists to increment version
        existing = db.table("semantic_definitions") \
            .select("version") \
            .eq("tenant_id", tenant_id) \
            .eq("term", term) \
            .execute()

        new_version = 1
        if existing.data:
            new_version = (existing.data[0].get("version") or 0) + 1

        result = db.table("semantic_definitions").upsert({
            "tenant_id": tenant_id,
            "term": term.lower().strip(),
            "definition": definition.strip(),
            "owner": owner,
            "scope": scope,
            "version": new_version
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
        print(f"[Semantic Dictionary] Failed to delete definition: {e}")
        return False
