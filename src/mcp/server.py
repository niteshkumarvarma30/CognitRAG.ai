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
