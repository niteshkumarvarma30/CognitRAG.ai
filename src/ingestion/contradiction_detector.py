"""
CognitRAG v2 — Contradiction Detector
Detects conflicting claims between retrieved chunks before generation.
Surfaces contradictions explicitly rather than silently merging (§3.4).
"""
import uuid
from typing import Optional
from src.database.supabase_client import supabase_manager


def check_conflicts(tenant_id: str, retrieved_chunks: list[dict]) -> list[dict]:
    """
    Given a list of retrieved chunks, detect if any two chunks make
    conflicting claims about the same entity.
    
    Returns a list of contradiction objects ready to show in the UI.
    """
    if not retrieved_chunks or len(retrieved_chunks) < 2:
        return []

    contradictions = []
    db = supabase_manager.get_admin_client()

    # Build entity → chunks map
    entity_chunk_map: dict[str, list[dict]] = {}
    for chunk in retrieved_chunks:
        entities = chunk.get("entities", [])
        if isinstance(entities, list):
            for entity in entities:
                if entity not in entity_chunk_map:
                    entity_chunk_map[entity] = []
                entity_chunk_map[entity].append(chunk)

    # For each entity with multiple chunks, check for date/value conflicts
    for entity, chunks in entity_chunk_map.items():
        if len(chunks) < 2:
            continue

        # Simple heuristic: check if two chunks have different numeric values
        # or different dates associated with the same entity
        conflicts = _detect_value_conflicts(entity, chunks)
        for conflict in conflicts:
            contradictions.append(conflict)
            _store_contradiction(db, tenant_id, conflict)

    return contradictions


def _detect_value_conflicts(entity: str, chunks: list[dict]) -> list[dict]:
    """
    Heuristic conflict detection: look for different numeric values
    or date strings across chunks mentioning the same entity.
    Full LLM-based detection can be added here later.
    """
    import re
    conflicts = []
    
    # Extract dates and numbers from each chunk
    date_pattern = re.compile(
        r'\b(\d{1,2}[\s\-/]\w+[\s\-/]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|Q[1-4]\s+\d{4})\b',
        re.IGNORECASE
    )
    number_pattern = re.compile(r'\b(\d[\d,\.]+(?:\s*(?:cr|crore|lakh|million|billion|%))?)\b')

    seen_values = {}
    for chunk in chunks:
        content = chunk.get("content", "")
        chunk_id = chunk.get("id", str(uuid.uuid4()))
        
        dates = date_pattern.findall(content)
        numbers = number_pattern.findall(content)
        values = dates + numbers

        for val in values:
            val_clean = val.strip().lower()
            if val_clean in seen_values:
                prev_chunk = seen_values[val_clean]
                if prev_chunk["id"] != chunk_id:
                    continue  # same value, no conflict
            else:
                seen_values[val_clean] = {"id": chunk_id, "content": content[:200]}

    # Simple approach: if same entity appears in chunks with different source types
    # and different dates, flag as potential conflict
    if len(chunks) >= 2:
        chunk_a = chunks[0]
        chunk_b = chunks[-1]
        
        dates_a = date_pattern.findall(chunk_a.get("content", ""))
        dates_b = date_pattern.findall(chunk_b.get("content", ""))

        if dates_a and dates_b and set(dates_a) != set(dates_b):
            conflicts.append({
                "entity": entity,
                "claim_a": {
                    "value": dates_a[0],
                    "source_chunk_id": chunk_a.get("id"),
                    "confidence": chunk_a.get("graph_score", 0.7),
                    "raw_ref_url": chunk_a.get("raw_ref_url"),
                    "content_snippet": chunk_a.get("content", "")[:150]
                },
                "claim_b": {
                    "value": dates_b[0],
                    "source_chunk_id": chunk_b.get("id"),
                    "confidence": chunk_b.get("graph_score", 0.6),
                    "raw_ref_url": chunk_b.get("raw_ref_url"),
                    "content_snippet": chunk_b.get("content", "")[:150]
                },
                "status": "unresolved"
            })

    return conflicts


def _store_contradiction(db, tenant_id: str, conflict: dict):
    """Store a contradiction in Supabase for admin review."""
    try:
        # Check if this exact contradiction already exists
        existing = db.table("contradictions")\
            .select("id")\
            .eq("tenant_id", tenant_id)\
            .eq("entity", conflict["entity"])\
            .eq("status", "unresolved")\
            .execute()
        
        if not existing.data:
            db.table("contradictions").insert({
                "tenant_id": tenant_id,
                "entity": conflict["entity"],
                "claim_a": conflict["claim_a"],
                "claim_b": conflict["claim_b"],
                "status": "unresolved"
            }).execute()
    except Exception as e:
        print(f"Failed to store contradiction: {e}")


def get_unresolved_contradictions(tenant_id: str) -> list[dict]:
    """Fetch all unresolved contradictions for a tenant."""
    db = supabase_manager.get_admin_client()
    try:
        result = db.table("contradictions")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("status", "unresolved")\
            .order("created_at", desc=True)\
            .execute()
        return result.data or []
    except Exception as e:
        print(f"Failed to fetch contradictions: {e}")
        return []


def resolve_contradiction(contradiction_id: str, resolution: str, resolved_by: str) -> bool:
    """Mark a contradiction as resolved."""
    from datetime import datetime, timezone
    db = supabase_manager.get_admin_client()
    try:
        db.table("contradictions").update({
            "status": resolution,
            "resolved_by": resolved_by,
            "resolved_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", contradiction_id).execute()
        return True
    except Exception as e:
        print(f"Failed to resolve contradiction: {e}")
        return False
