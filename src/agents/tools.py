"""
Agent Tools
============
A library of Python tool functions that the LLM Agent can autonomously call.
Each tool is a self-contained function that performs one specific action
(query the Semantic Dictionary, search the Vector Store, traverse the
Knowledge Graph, or execute a read-only SQL query).

The agent decides which tools to fire based on the user's question.
"""
import json
from typing import Optional


def fetch_metric_definition(term: str, tenant_id: str) -> str:
    """Look up the governed business definition for a specific term
    from the Semantic Dictionary. Use this when the user mentions a
    business metric like 'revenue', 'churn risk', or 'active customer'.

    Args:
        term: The business term to look up (e.g. 'churn risk').
        tenant_id: The tenant UUID.

    Returns:
        The governed definition if found, or a message saying it was not found.
    """
    from src.semantic.ontology import fetch_semantic_definitions
    result = fetch_semantic_definitions(tenant_id, term)
    if result:
        return f"GOVERNED DEFINITION FOUND: {result}"
    return f"No governed definition found for '{term}'. Proceed with available context."


def search_knowledge_base(query: str, tenant_id: str, user_id: str = "default_user") -> str:
    """Search the company's knowledge base using hybrid retrieval
    (BM25 keyword search + Vector semantic search + Reciprocal Rank Fusion).
    Use this when the user asks a factual question about company documents.

    Args:
        query: The search query.
        tenant_id: The tenant UUID.
        user_id: The user ID for personalization.

    Returns:
        The top retrieved document chunks as a formatted string.
    """
    from src.retrieval.hybrid import hybrid_retriever, get_embedding
    try:
        query_embedding = get_embedding(query)
        docs, high_conf = hybrid_retriever(tenant_id, user_id, query, query_embedding, top_k=5)
        if not docs:
            return "No relevant documents found in the knowledge base."

        results = []
        for i, doc in enumerate(docs[:5], 1):
            content = doc.get("content", "")[:300]
            results.append(f"[Chunk {i}]: {content}")
        return "\n\n".join(results)
    except Exception as e:
        return f"Knowledge base search failed: {e}"


def traverse_knowledge_graph(entities: list, tenant_id: str) -> str:
    """Traverse the Neo4j Knowledge Graph to find relationships between entities.
    Use this when the user asks how concepts are related, connected, or when
    they ask about dependencies between technical terms.

    Args:
        entities: A list of entity names to look up in the graph.
        tenant_id: The tenant UUID.

    Returns:
        A list of relationships found between the entities.
    """
    try:
        from src.database.neo4j_client import neo4j_manager
        with neo4j_manager.driver.session() as session:
            res = session.run("""
                MATCH (n:Entity {tenantId: $tenant_id})-[r:RELATION]-(m:Entity {tenantId: $tenant_id})
                WHERE n.name IN $entities
                RETURN n.name AS source, r.type AS rel_type, m.name AS target
                LIMIT 15
            """, tenant_id=tenant_id, entities=entities)

            sentences = []
            for record in res:
                sentences.append(
                    f"{record['source']} --[{record['rel_type']}]--> {record['target']}"
                )

            if sentences:
                return "Knowledge Graph Relationships:\n" + "\n".join(sentences)
            return f"No relationships found in the graph for entities: {entities}"
    except Exception as e:
        return f"Graph traversal failed: {e}"


def query_sql_database(sql_query: str, tenant_id: str) -> str:
    """Execute a READ-ONLY SQL query against the tenant's Supabase database.
    Use this when the user asks for specific data that requires a database query,
    like counts, sums, or filtered lookups.

    CRITICAL: Only SELECT queries are allowed. Never execute INSERT, UPDATE, DELETE, or DROP.

    Args:
        sql_query: A read-only SQL SELECT query.
        tenant_id: The tenant UUID.

    Returns:
        The query results as a formatted string.
    """
    # Safety check: block any write operations
    dangerous_keywords = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "CREATE"]
    upper_query = sql_query.upper().strip()
    for keyword in dangerous_keywords:
        if keyword in upper_query:
            return f"BLOCKED: Write operation '{keyword}' is not allowed. Only SELECT queries are permitted."

    if not upper_query.startswith("SELECT"):
        return "BLOCKED: Only SELECT queries are permitted."

    try:
        from src.database.supabase_client import supabase_manager
        db = supabase_manager.get_admin_client()
        # Use Supabase's RPC to execute raw SQL safely
        result = db.rpc("execute_readonly_sql", {"query_text": sql_query}).execute()
        if result.data:
            return f"Query Results:\n{json.dumps(result.data, indent=2)[:2000]}"
        return "Query returned no results."
    except Exception as e:
        return f"SQL query failed: {e}"


# ---------------------------------------------------------------
# Tool Registry — used by the Agent node to expose tools to the LLM
# ---------------------------------------------------------------

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "fetch_metric_definition",
            "description": "Look up the governed business definition for a specific business term from the Semantic Dictionary. Use this when the user mentions a business metric like 'revenue', 'churn risk', or 'active customer'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "term": {
                        "type": "string",
                        "description": "The business term to look up (e.g. 'churn risk', 'monthly revenue')."
                    }
                },
                "required": ["term"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": "Search the company's knowledge base using hybrid retrieval (BM25 + Vector + RRF). Use for factual questions about company documents, policies, or technical information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query to find relevant documents."
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "traverse_knowledge_graph",
            "description": "Traverse the Neo4j Knowledge Graph to find relationships between entities. Use when the user asks how concepts are related, connected, or asks about dependencies.",
            "parameters": {
                "type": "object",
                "properties": {
                    "entities": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "A list of entity names to look up in the graph."
                    }
                },
                "required": ["entities"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_sql_database",
            "description": "Execute a read-only SQL SELECT query against the tenant's database. Use when the user asks for specific data counts, sums, or filtered lookups. ONLY SELECT queries are allowed.",
            "parameters": {
                "type": "object",
                "properties": {
                    "sql_query": {
                        "type": "string",
                        "description": "A read-only SQL SELECT query."
                    }
                },
                "required": ["sql_query"]
            }
        }
    }
]

# Map of function name -> callable for the tool executor
TOOL_MAP = {
    "fetch_metric_definition": fetch_metric_definition,
    "search_knowledge_base": search_knowledge_base,
    "traverse_knowledge_graph": traverse_knowledge_graph,
    "query_sql_database": query_sql_database,
}
