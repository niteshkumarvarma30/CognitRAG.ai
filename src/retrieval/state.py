from typing import TypedDict, List, Dict, Any

class GraphState(TypedDict):
    """Represents the strictly typed state of our CRAG graph."""
    tenant_id: str
    user_id: str
    question: str
    query_embedding: List[float]
    generation: str
    documents: str
    route: str
    chat_history: List[Dict[str, Any]]
    preferences: dict
    summary: str
    rewrite_count: int
    system_prompt: str
    context_block: str
    rolling_context: str
    user_facts: str
    need_memory: bool
    need_graph: bool
    high_confidence: bool
    query_entities: List[str]
    candidate_entities: List[str]
    graph_context: str
