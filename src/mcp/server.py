import os
import asyncio
from typing import Any, List, Dict
from mcp.server.fastmcp import FastMCP
from src.retrieval.hybrid import hybrid_retriever
from src.database.supabase_client import supabase_manager
from src.semantic.ontology import get_all_definitions

# Initialize the FastMCP Server
mcp = FastMCP("CognitRAG Company Brain")

@mcp.tool()
async def search_company_knowledge(query: str, tenant_id: str) -> str:
    """
    Search the company's internal semantic knowledge graph and SOPs.
    Use this tool to find architectural decisions, HR policies, requirements, and codebase context.
    
    Args:
        query: The search query to look up in the vector database.
        tenant_id: The workspace/tenant UUID.
    """
    try:
        # We use a default system user for API/MCP programmatic access
        user_id = "mcp_system_user" 
        
        # Retrieve chunks from the hybrid semantic/keyword search
        chunks = hybrid_retriever(tenant_id, query, top_k=5, user_id=user_id)
        
        if not chunks:
            return "No relevant company knowledge found for this query."
            
        result_text = "### CognitRAG Search Results:\n\n"
        for chunk in chunks:
            result_text += f"**Source**: {chunk['filename']}\n"
            result_text += f"{chunk['content']}\n\n"
            
        return result_text
    except Exception as e:
        return f"Error executing knowledge search: {str(e)}"

@mcp.tool()
async def get_semantic_dictionary(tenant_id: str) -> str:
    """
    Retrieves the company's governed Semantic Dictionary containing all official acronyms, 
    jargon, and metric definitions.
    
    Args:
        tenant_id: The workspace/tenant UUID.
    """
    try:
        definitions = get_all_definitions(tenant_id)
        if not definitions:
            return "No semantic definitions configured for this workspace."
            
        result_text = "### Company Semantic Dictionary:\n\n"
        for d in definitions:
            result_text += f"- **{d['term']}**: {d['definition']} (Owner: {d.get('owner', 'None')})\n"
            
        return result_text
    except Exception as e:
        return f"Error fetching semantic dictionary: {str(e)}"

@mcp.tool()
async def ingest_document_via_mcp(title: str, content: str, tenant_id: str) -> str:
    """
    Ingest a new document, markdown spec, architectural note, or meeting memo directly 
    into the company's Supabase Vector database and Neo4j Knowledge Graph.
    
    Args:
        title: The name/title of the document (e.g. 'Billing_Architecture_v2.md').
        content: The raw text/markdown body of the document.
        tenant_id: The workspace/tenant UUID.
    """
    try:
        from src.ingestion.parser import chunk_text
        from src.ingestion.pipeline import run_ingestion_pipeline
        from src.api.routes import get_tenant_uuid
        
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        
        # Ensure tenant exists
        admin_db.table("tenants").upsert({"id": uuid_tenant, "name": f"User {tenant_id}"}).execute()
        db = supabase_manager.get_tenant_client(uuid_tenant)
        
        # 1. Insert document record into Supabase
        doc_res = db.table("documents").insert({
            "tenant_id": uuid_tenant,
            "filename": f"mcp/{title}",
            "status": "pending"
        }).execute()
        
        if not doc_res.data:
            return "Failed to create document record in Supabase."
            
        doc_id = doc_res.data[0]["id"]
        
        # 2. Chunk & run hybrid ingestion pipeline (Vectors + Neo4j Graph)
        chunks = chunk_text(content)
        run_ingestion_pipeline(uuid_tenant, doc_id, chunks)
        
        # 3. Mark completed
        db.table("documents").update({"status": "completed"}).eq("id", doc_id).execute()
        
        return f"Successfully ingested document '{title}' into Supabase and Neo4j (ID: {doc_id}, {len(chunks)} chunks embedded)."
    except Exception as e:
        return f"Error ingesting document via MCP: {str(e)}"

@mcp.tool()
async def save_agent_memory(agent_id: str, fact_or_decision: str, tenant_id: str) -> str:
    """
    Saves an episodic memory or architectural decision recorded by an AI agent into 
    the company's long-term memory hub.
    
    Args:
        agent_id: Identifier of the AI agent saving the memory.
        fact_or_decision: The key finding, decision, or memory to persist.
        tenant_id: The workspace/tenant UUID.
    """
    try:
        from src.api.routes import get_tenant_uuid
        uuid_tenant = get_tenant_uuid(tenant_id)
        db = supabase_manager.get_tenant_client(uuid_tenant)
        
        db.table("user_facts").insert({
            "tenant_id": uuid_tenant,
            "fact": f"[{agent_id}] {fact_or_decision}",
            "category": "agent_memory"
        }).execute()
        
        return f"Memory successfully persisted to workspace memory hub by agent '{agent_id}'."
    except Exception as e:
        return f"Error saving agent memory: {str(e)}"

@mcp.resource("cognitrag://{tenant_id}/audit_log")
def get_audit_log(tenant_id: str) -> str:
    """
    Returns the recent audit events for the workspace as a standard MCP resource.
    """
    try:
        db = supabase_manager.get_admin_client()
        result = db.table("audit_events") \
            .select("*") \
            .eq("workspace_id", tenant_id) \
            .order("created_at", desc=True) \
            .limit(50) \
            .execute()
            
        if not result.data:
            return "No recent audit events."
            
        log_text = ""
        for row in result.data:
            log_text += f"[{row['created_at']}] {row['action']} by {row['actor_id']} on {row['resource']}\n"
        return log_text
    except Exception as e:
        return f"Error fetching audit log: {str(e)}"

def run_mcp_stdio():
    """Run the MCP server over Standard I/O (for local IDE integrations like Cursor)"""
    print("Starting CognitRAG MCP Server on STDIO...", flush=True)
    mcp.run(transport="stdio")

def run_mcp_sse():
    """Run the MCP server over SSE (for remote AI Agents over the web)"""
    print("Starting CognitRAG MCP Server on SSE...", flush=True)
    mcp.run(transport="sse", host="0.0.0.0", port=8001)

if __name__ == "__main__":
    import sys
    # Allow running via python -m src.mcp.server --sse
    if "--sse" in sys.argv:
        run_mcp_sse()
    else:
        run_mcp_stdio()
