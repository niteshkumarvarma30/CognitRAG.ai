from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from src.database.supabase_client import supabase_manager
from src.ingestion.parser import parse_pdf, chunk_text
from src.ingestion.vector_worker import process_vector_track_sync
from src.ingestion.graph_worker import process_graph_track_sync
from src.retrieval.graph import crag_app

router = APIRouter()

class ChatRequest(BaseModel):
    tenant_id: str
    user_id: Optional[str] = "default_user"
    message: str
    chat_history: Optional[List[Dict[str, Any]]] = []

@router.post("/api/v1/chat")
def chat_endpoint(request: ChatRequest):
    """Executes the full Hybrid CRAG loop and logs token usage for billing."""
    initial_state = {
        "tenant_id": request.tenant_id,
        "user_id": request.user_id,
        "question": request.message,
        "generation": "",
        "documents": "",
        "route": "",
        "chat_history": request.chat_history
    }
    
    # 1. Execute LangGraph
    final_state = crag_app.invoke(initial_state)
    answer = final_state["generation"]
    
    # Format the context from retrieved documents
    context_docs = final_state.get("documents", [])
    if isinstance(context_docs, str):
        context_string = context_docs
    else:
        context_string = "\n\n".join([doc.page_content for doc in context_docs if hasattr(doc, "page_content")])
    
    # 2. Phase 4 Usage Tracking (Mock Token Count)
    try:
        # Roughly estimate tokens: 1 word ~ 1.3 tokens
        estimated_tokens = int(len(answer.split()) * 1.3) + int(len(request.message.split()) * 1.3)
        
        # Use tenant client to write to transactions so the RLS RETURNING clause succeeds
        db = supabase_manager.get_tenant_client(request.tenant_id)
        db.table("transactions").insert({
            "tenant_id": request.tenant_id,
            "tokens_used": estimated_tokens
        }).execute()
        print(f"Logged {estimated_tokens} tokens for billing on Tenant {request.tenant_id}.")
    except Exception as e:
        print(f"Failed to log transaction: {e}")
    
    return {"answer": answer, "context": context_string}

def background_ingestion_pipeline(tenant_id: str, document_id: str, pdf_bytes: bytes):
    """Orchestrates the entire ingestion process asynchronously."""
    db = supabase_manager.get_tenant_client(tenant_id)
    try:
        text = parse_pdf(pdf_bytes)
        chunks = chunk_text(text)
        process_vector_track_sync(tenant_id, document_id, chunks)
        process_graph_track_sync(tenant_id, document_id, chunks)
        db.table("documents").update({"status": "completed"}).eq("id", document_id).execute()
        print(f"Successfully processed document {document_id}")
    except Exception as e:
        print(f"Pipeline failed for document {document_id}: {e}")
        db.table("documents").update({"status": "failed"}).eq("id", document_id).execute()


@router.post("/api/v1/ingest")
async def ingest_document(
    background_tasks: BackgroundTasks,
    tenant_id: str = Form(...),
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    pdf_bytes = await file.read()
    
    db = supabase_manager.get_tenant_client(tenant_id)
    response = db.table("documents").insert({
        "tenant_id": tenant_id,
        "filename": file.filename,
        "status": "pending"
    }).execute()
    
    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to insert document record into Supabase.")
        
    document_id = response.data[0]['id']
    background_tasks.add_task(background_ingestion_pipeline, tenant_id, document_id, pdf_bytes)
    
    return {"message": "Document ingestion successfully started in the background.", "document_id": document_id}

@router.get("/api/v1/billing/{tenant_id}")
def get_billing(tenant_id: str):
    """Calculates the total tokens used by a tenant and the estimated bill."""
    db = supabase_manager.get_tenant_client(tenant_id)
    try:
        response = db.table("transactions").select("tokens_used").eq("tenant_id", tenant_id).execute()
        total_tokens = sum(row.get("tokens_used", 0) for row in response.data)
        
        # Example pricing: $0.001 per 1000 tokens
        estimated_cost_usd = (total_tokens / 1000.0) * 0.001
        
        return {
            "tenant_id": tenant_id,
            "total_tokens_used": total_tokens,
            "estimated_cost_usd": round(estimated_cost_usd, 6)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch billing data: {e}")
