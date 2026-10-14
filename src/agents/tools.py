"""
Agent Tools Module
===================
Provides tool definitions and execution functions for agentic query execution.
"""
import json
from src.retrieval.hybrid import hybrid_retriever, get_embedding
from src.semantic.ontology import fetch_semantic_definitions


def fetch_metric_definition(term: str, tenant_id: str) -> str:
    """Look up governed business definition for a term."""
    result = fetch_semantic_definitions(tenant_id, term)
    if result:
        return f"GOVERNED DEFINITION FOUND: {result}"
    return f"No governed definition found for '{term}'."


def search_knowledge_base(query: str, tenant_id: str, user_id: str = "default_user") -> str:
    """Search company knowledge base using hybrid retrieval."""
    try:
        query_embedding = get_embedding(query)
        docs, _ = hybrid_retriever(tenant_id, user_id, query, query_embedding, top_k=5)
        if not docs:
            return "No relevant documents found."

        results = []
        for i, doc in enumerate(docs[:5], 1):
            content = doc.get("content", "")[:300]
            results.append(f"[Chunk {i}]: {content}")
        return "\n\n".join(results)
    except Exception as e:
        return f"Knowledge base search failed: {e}"


def traverse_knowledge_graph(entities: list, tenant_id: str) -> str:
    """Traverse Neo4j Knowledge Graph to find relationships between entities."""
    try:
        from src.database.neo4j_client import neo4j_manager
        with neo4j_manager.driver.session() as session:
            res = session.run("""
                MATCH (n:Entity {tenantId: $tenant_id})-[r:RELATION]-(m:Entity {tenantId: $tenant_id})
                WHERE n.name IN $entities
                RETURN n.name AS source, r.type AS rel_type, m.name AS target
                LIMIT 15
            """, tenant_id=tenant_id, entities=entities)

            sentences = [
                f"{record['source']} --[{record['rel_type']}]--> {record['target']}"
                for record in res
            ]
            if sentences:
                return "Knowledge Graph Relationships:\n" + "\n".join(sentences)
            return f"No relationships found in graph for entities: {entities}"
    except Exception as e:
        return f"Graph traversal failed: {e}"


TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "fetch_metric_definition",
            "description": "Look up governed definition for a business term from the Semantic Dictionary.",
            "parameters": {
                "type": "object",
                "properties": {
                    "term": {"type": "string", "description": "The term to look up."}
                },
                "required": ["term"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": "Search company knowledge base using hybrid retrieval.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query."}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "traverse_knowledge_graph",
            "description": "Traverse Neo4j Knowledge Graph to find relationships between entities.",
            "parameters": {
                "type": "object",
                "properties": {
                    "entities": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of entity names."
                    }
                },
                "required": ["entities"]
            }
        }
    }
]

TOOL_MAP = {
    "fetch_metric_definition": fetch_metric_definition,
    "search_knowledge_base": search_knowledge_base,
    "traverse_knowledge_graph": traverse_knowledge_graph,
}
