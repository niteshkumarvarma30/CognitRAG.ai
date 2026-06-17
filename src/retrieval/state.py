from typing import TypedDict, List, Dict, Any

class GraphState(TypedDict):
    """Represents the strictly typed state of our CRAG graph."""
    tenant_id: str
    user_id: str
    question: str
    generation: str
    documents: str
    route: str
    chat_history: List[Dict[str, Any]]
    preferences: dict
    summary: str
    rewrite_count: int
    system_prompt: str
    context_block: str
