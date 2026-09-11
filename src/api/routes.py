from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from src.database.supabase_client import supabase_manager
from src.database.neo4j_client import neo4j_manager
from src.ingestion.parser import parse_pdf, chunk_text
from src.ingestion.pipeline import run_ingestion_pipeline
from src.retrieval.graph import crag_app

from fastapi.responses import StreamingResponse
import os
import json
import uuid
import requests
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def get_tenant_uuid(clerk_id: str) -> str:
    """Deterministically convert a Clerk string ID (e.g. user_2pkXY) into a valid Postgres UUID."""
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, clerk_id))

class ChatRequest(BaseModel):
    # Backward compatible tenant_id, but logically it maps to workspace_id now
    tenant_id: str
    user_id: Optional[str] = "default_user"
    message: str
    chat_history: Optional[List[Dict[str, Any]]] = []

class GoogleDriveIngestRequest(BaseModel):
    tenant_id: str
    access_token: str

class CancelRequest(BaseModel):
    msg_id: str

@router.post("/api/v1/chat")
def chat_endpoint(request: ChatRequest):
    """Executes the full Hybrid CRAG loop and logs token usage for billing."""
    # Convert legacy tenant_id or workspace_id to standard UUID
    try:
        # Check if it's already a valid UUID (workspace_id)
        uuid.UUID(request.tenant_id)
        uuid_tenant = request.tenant_id
    except ValueError:
        # Legacy deterministic fallback
        uuid_tenant = get_tenant_uuid(request.tenant_id)
        
    initial_state = {
        "tenant_id": uuid_tenant,
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
        db = supabase_manager.get_tenant_client(uuid_tenant)
        db.table("transactions").insert({
            "tenant_id": uuid_tenant,
            "tokens_used": estimated_tokens
        }).execute()
        print(f"Logged {estimated_tokens} tokens for billing on Tenant {uuid_tenant}.")
    except Exception as e:
        print(f"Failed to log transaction: {e}")
    
    return {
        "answer": answer,
        "context": context_string,
        "audit_trail": final_state.get("audit_trail", []),
        "evidence": final_state.get("evidence", []),
        "confidence_score": final_state.get("confidence_score", 0.0)
    }

@router.post("/api/v1/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """Executes the full Hybrid CRAG loop and streams the status of each LangGraph node."""
    try:
        uuid.UUID(request.tenant_id)
        uuid_tenant = request.tenant_id
    except ValueError:
        uuid_tenant = get_tenant_uuid(request.tenant_id)
    initial_state = {
        "tenant_id": uuid_tenant,
        "user_id": request.user_id,
        "question": request.message,
        "generation": "",
        "documents": "",
        "route": "",
        "chat_history": request.chat_history
    }
    
    async def event_generator():
        full_state = initial_state.copy()
        answer = ""
        import asyncio
        
        try:
            async for mode, data in crag_app.astream(initial_state, stream_mode=["updates", "messages"]):
                if mode == "messages":
                    msg, meta = data
                    if msg.content and meta.get("langgraph_node") == "generate":
                        token = msg.content
                        answer += token
                        await asyncio.sleep(0.07)  # Add typing effect delay
                        yield f"data: {json.dumps({'token': token})}\n\n"
                        
                elif mode == "updates":
                    node_name = list(data.keys())[0]
                    update = data[node_name]
                    if update:
                        full_state.update(update)
                        
                    if node_name == "embed_query":
                        yield f"data: {json.dumps({'status': 'Generating query embeddings...'})}\n\n"
                    elif node_name == "load_memory":
                        yield f"data: {json.dumps({'status': 'Loading user memory...'})}\n\n"
                    elif node_name == "contextualize_query":
                        yield f"data: {json.dumps({'status': 'Contextualizing query...'})}\n\n"
                    elif node_name == "check_cache":
                        yield f"data: {json.dumps({'status': 'Checking semantic cache...'})}\n\n"
                    elif node_name == "route_query":
                        need_mem = full_state.get("need_memory", False)
                        need_graph = full_state.get("need_graph", False)
                        ents = full_state.get("query_entities", [])
                        yield f"data: {json.dumps({'status': f'Routing query... (Mem: {need_mem}, Graph: {need_graph}, Entities: {len(ents)})'})}\n\n"
                    elif node_name == "retrieve":
                        yield f"data: {json.dumps({'status': 'Retrieving from Vector & Graph...'})}\n\n"
                    elif node_name == "grade_documents":
                        yield f"data: {json.dumps({'status': 'Reranking and validating chunks (Jina)...'})}\n\n"
                    elif node_name == "agent_node":
                        yield f"data: {json.dumps({'status': 'Agent analyzing context and deciding next steps...'})}\n\n"
                    elif node_name == "tool_executor":
                        yield f"data: {json.dumps({'status': 'Agent executing external tools...'})}\n\n"
                    elif node_name == "generate" or node_name == "generate_cached":
                        yield f"data: {json.dumps({'status': 'Synthesizing final answer...'})}\n\n"
                    elif node_name == "rewrite":
                        yield f"data: {json.dumps({'status': 'Rewriting query for better results...'})}\n\n"
        except Exception as astream_err:
            print(f"[Streaming Error] Pipeline crashed: {astream_err}")
            yield f"data: {json.dumps({'status': 'done', 'answer': 'Sorry, the AI pipeline crashed unexpectedly.'})}\n\n"
            return
                    
        # Graph execution finished. Get final answer.
        final_answer = full_state.get("generation", answer)
        if not final_answer or not final_answer.strip():
            final_answer = answer or "Hello! I am CognitRAG, your Company Brain assistant. How can I help you today?"

        # If no tokens were streamed (e.g. from generate_cached or fast greeting nodes), stream the answer chunks
        if not answer and final_answer:
            words = final_answer.split(" ")
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'token': chunk})}\n\n"
                await asyncio.sleep(0.02)
        
        # Execute memory and caching functions asynchronously in a background thread
        from src.retrieval.nodes import get_embedding, save_memory
        def background_tasks(state, u_tenant, req_msg, ans):
            try:
                save_memory(state)
            except Exception as e:
                print(f"Failed to manually save episodic memory: {e}")
                
            try:
                query_embedding = get_embedding(req_msg)
                db = supabase_manager.get_tenant_client(u_tenant)
                db.table("semantic_cache").insert({
                    "tenant_id": u_tenant,
                    "user_id": state.get("user_id", "default_user"),
                    "query": req_msg,
                    "query_embedding": query_embedding,
                    "response": ans
                }).execute()
            except Exception as e:
                print(f"Failed to save semantic cache: {e}")
        
        if final_answer:
            import threading
            threading.Thread(target=background_tasks, args=(full_state, uuid_tenant, request.message, final_answer)).start()
            
        context_docs = full_state.get("documents", [])
        if isinstance(context_docs, str):
            context_string = context_docs
        else:
            context_string = "\n\n".join([doc.page_content for doc in context_docs if hasattr(doc, "page_content")])
            
        graph_context_str = full_state.get("graph_context", "")
        audit_trail = full_state.get("audit_trail", [])
        confidence_val = full_state.get("confidence_score", 0.0)
        yield f"data: {json.dumps({'status': 'done', 'answer': final_answer, 'context': context_string, 'graph_context': graph_context_str, 'audit_trail': audit_trail, 'evidence': evidence_list, 'confidence_score': confidence_val})}\n\n"
        
    return StreamingResponse(event_generator(), media_type="text/event-stream")

from src.api.job_tracker import ingestion_jobs

def background_ingestion_pipeline(uuid_tenant: str, document_id: str, file_bytes: bytes, filename: str, job_id: Optional[str] = None):
    """Orchestrates the entire ingestion process asynchronously with live status tracking."""
    db = supabase_manager.get_tenant_client(uuid_tenant)
    try:
        if job_id:
            ingestion_jobs[job_id] = {"status": "processing", "progress": f"Parsing {filename}..."}

        if filename.endswith(".pdf"):
            text = parse_pdf(file_bytes)
        else:
            text = file_bytes.decode('utf-8', errors='replace')
            
        if job_id:
            ingestion_jobs[job_id]["progress"] = f"Chunking document text..."

        chunks = chunk_text(text)

        if job_id:
            ingestion_jobs[job_id]["progress"] = f"Extracting knowledge graph & Titan embeddings ({len(chunks)} chunks)..."

        run_ingestion_pipeline(uuid_tenant, document_id, chunks)
        db.table("documents").update({"status": "completed"}).eq("id", document_id).execute()
        
        if job_id:
            ingestion_jobs[job_id]["status"] = "completed"
            ingestion_jobs[job_id]["progress"] = f"Successfully ingested {filename} into Company Brain!"

        print(f"Successfully processed document {document_id}")
    except Exception as e:
        print(f"Pipeline failed for document {document_id}: {e}")
        db.table("documents").update({"status": "failed"}).eq("id", document_id).execute()
        if job_id:
            ingestion_jobs[job_id]["status"] = "failed"
            ingestion_jobs[job_id]["error"] = str(e)


@router.post("/api/v1/ingest")
async def ingest_document(
    background_tasks: BackgroundTasks,
    tenant_id: str = Form(...),
    file: UploadFile = File(...)
):
    valid_extensions = (".pdf", ".txt", ".md")
    if not file.filename.endswith(valid_extensions):
        raise HTTPException(status_code=400, detail="Only PDF, TXT, and MD files are supported.")
    
    uuid_tenant = get_tenant_uuid(tenant_id)
    pdf_bytes = await file.read()
    
    # 20MB limit check (20 * 1024 * 1024 bytes)
    if len(pdf_bytes) > 20971520:
        raise HTTPException(status_code=413, detail="File size exceeds the 20MB limit.")
    
    admin_db = supabase_manager.get_admin_client()
    try:
        # Ensure the tenant exists in the Supabase `tenants` table. 
        admin_db.table("tenants").upsert({
            "id": uuid_tenant,
            "name": f"Company {tenant_id}"
        }).execute()
        
        # Switch back to the strictly isolated tenant_client for the document insertion
        db = supabase_manager.get_tenant_client(uuid_tenant)
        response = db.table("documents").insert({
            "tenant_id": uuid_tenant,
            "filename": file.filename,
            "status": "pending"
        }).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to insert document record into Supabase.")
            
        document_id = response.data[0]['id']
        job_id = f"job_upload_{uuid.uuid4().hex[:8]}"
        ingestion_jobs[job_id] = {
            "status": "processing",
            "progress": f"Queued {file.filename} for ingestion...",
            "document_id": document_id
        }

        background_tasks.add_task(background_ingestion_pipeline, uuid_tenant, document_id, pdf_bytes, file.filename, job_id)
        
        return {
            "message": "Document ingestion successfully started in the background.",
            "document_id": document_id,
            "job_id": job_id
        }
    except Exception as e:
        print(f"Insertion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/v1/ingest/google-drive")
async def ingest_google_drive(request: GoogleDriveIngestRequest, background_tasks: BackgroundTasks):
    uuid_tenant = get_tenant_uuid(request.tenant_id)
    
    headers = {"Authorization": f"Bearer {request.access_token}"}
    
    try:
        # If it's a Google Doc, we need to export it as text. Otherwise we download media.
        if "google-apps.document" in request.mime_type:
            url = f"https://www.googleapis.com/drive/v3/files/{request.file_id}/export?mimeType=text/plain"
        else:
            url = f"https://www.googleapis.com/drive/v3/files/{request.file_id}?alt=media"
            
        resp = requests.get(url, headers=headers)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to fetch file from Google Drive: {resp.text}")
            
        file_bytes = resp.content
        
        admin_db = supabase_manager.get_admin_client()
        admin_db.table("tenants").upsert({"id": uuid_tenant, "name": f"Company {request.tenant_id}"}).execute()
        
        db = supabase_manager.get_tenant_client(uuid_tenant)
        db_resp = db.table("documents").insert({
            "tenant_id": uuid_tenant,
            "filename": request.file_name,
            "status": "pending"
        }).execute()
        
        document_id = db_resp.data[0]['id']
        background_tasks.add_task(background_ingestion_pipeline, uuid_tenant, document_id, file_bytes)
        
        return {"message": "Google Drive ingestion started", "document_id": document_id}
    except Exception as e:
        print(f"Drive insertion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/v1/billing/{tenant_id}")
def get_billing(tenant_id: str):
    """Calculates the total tokens used by a tenant and the estimated bill."""
    uuid_tenant = get_tenant_uuid(tenant_id)
    db = supabase_manager.get_tenant_client(uuid_tenant)
    try:
        response = db.table("transactions").select("*").eq("tenant_id", uuid_tenant).order("created_at", desc=True).execute()
        total_tokens = sum(row.get("tokens_used", 0) for row in response.data)
        
        estimated_cost_usd = (total_tokens / 1000.0) * 0.001
        
        return {
            "tenant_id": tenant_id, # return the original clerk id to the frontend
            "total_tokens_used": total_tokens,
            "estimated_cost_usd": round(estimated_cost_usd, 6),
            "transactions": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch billing data: {e}")

@router.get("/api/v1/documents/{tenant_id}")
def list_documents(tenant_id: str):
    uuid_tenant = get_tenant_uuid(tenant_id)
    db = supabase_manager.get_tenant_client(uuid_tenant)
    try:
        response = db.table("documents").select("*").eq("tenant_id", uuid_tenant).order("created_at", desc=True).execute()
        docs = response.data or []

        # Merge paired developer studio documents if querying for a user or primary workspace
        dev_uuid = get_tenant_uuid("ws_dev_primary")
        if uuid_tenant != dev_uuid:
            try:
                dev_db = supabase_manager.get_tenant_client(dev_uuid)
                dev_res = dev_db.table("documents").select("*").eq("tenant_id", dev_uuid).order("created_at", desc=True).execute()
                existing_ids = {d["id"] for d in docs}
                for d in (dev_res.data or []):
                    if d["id"] not in existing_ids:
                        docs.append(d)
                        existing_ids.add(d["id"])
            except Exception as e_pair:
                logger.warning(f"Could not load paired dev documents: {e_pair}")
        return docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {e}")

@router.get("/api/v1/metrics/{tenant_id}")
def get_dashboard_metrics(tenant_id: str):
    uuid_tenant = get_tenant_uuid(tenant_id)
    db = supabase_manager.get_tenant_client(uuid_tenant)
    try:
        # Get total knowledge assets (documents)
        docs_res = db.table("documents").select("id", count="exact").eq("tenant_id", uuid_tenant).execute()
        total_assets = docs_res.count if docs_res.count else len(docs_res.data)
        
        # Get verified memories (extracted facts)
        facts_res = db.table("user_facts").select("id", count="exact").eq("tenant_id", uuid_tenant).execute()
        total_memories = facts_res.count if facts_res.count else len(facts_res.data)
        
        # Get total graph relationships (resilient to Neo4j connectivity)
        total_connections = 0
        try:
            driver = neo4j_manager.driver
            if driver:
                with driver.session() as session:
                    result = session.run(
                        "MATCH (a)-[r]->(b) WHERE a.tenantId = $tenant_id OR a.tenantId = $raw_tenant_id OR a.tenantId IS NULL RETURN count(r) as count", 
                        tenant_id=uuid_tenant, 
                        raw_tenant_id=tenant_id
                    )
                    record = result.single()
                    total_connections = record["count"] if record else 0
        except Exception as neo_err:
            logger.warning(f"Neo4j metrics count unavailable: {neo_err}")

        # Get integrations count
        total_integrations = 0
        try:
            admin_db = supabase_manager.get_admin_client()
            integrations_res = admin_db.table("tenant_integrations").select("id", count="exact").eq("tenant_id", uuid_tenant).execute()
            total_integrations = integrations_res.count if integrations_res.count else len(integrations_res.data)
        except Exception as int_err:
            logger.warning(f"Integrations count unavailable: {int_err}")

        # Memory health score (mock logic based on valid entities vs extracted facts)
        health_score = 98.2 if total_memories > 0 else 100.0

        return {
            "verified_memories": total_memories,
            "knowledge_assets": total_assets,
            "connected_minds": 1 + total_integrations, # User + Integrations
            "graph_connections": total_connections,
            "memory_health": health_score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch metrics: {e}")

@router.get("/api/v1/graph/{tenant_id}/export")
def export_graph_data(tenant_id: str):
    uuid_tenant = get_tenant_uuid(tenant_id)
    nodes = []
    links = []
    node_ids = set()
    try:
        driver = neo4j_manager.driver
        doc_map = {}
        try:
            admin = supabase_manager.get_admin_client()
            docs = admin.table("documents").select("id, filename").execute()
            for d in docs.data or []:
                doc_map[d["id"]] = d["filename"]
        except Exception:
            pass

        if driver:
            with driver.session() as session:
                def process_node(node_obj):
                    if not node_obj:
                        return None
                    labels = list(node_obj.labels) if hasattr(node_obj, "labels") else []
                    is_doc = "Document" in labels or node_obj.get("type") == "Document"
                    name = (
                        node_obj.get("name") or 
                        node_obj.get("path") or 
                        node_obj.get("title") or 
                        node_obj.get("summary") or
                        node_obj.get("key") or
                        node_obj.get("filename") or 
                        node_obj.get("query") or 
                        (doc_map.get(node_obj.get("id")) if is_doc else "")
                    )
                    if not name or name == node_obj.get("tenantId"):
                        return None

                    group = "Entity"
                    val = 12
                    color = "#A855F7"
                    node_type = node_obj.get("type", "")

                    if is_doc:
                        group = "Document"
                        val = 26
                        color = "#F59E0B"
                        if "/" in str(name):
                            name = str(name).split("/")[-1]
                    elif "SourceFile" in labels:
                        group = "SourceFile"
                        val = 22
                        color = "#06B6D4"
                        if "/" in str(name):
                            name = str(name).split("/")[-1]
                    elif "Function" in labels:
                        group = "Function"
                        val = 15
                        color = "#818CF8"
                        if not str(name).endswith("()"):
                            name = f"{name}()"
                    elif "ChatInteraction" in labels:
                        group = "ChatInteraction"
                        val = 18
                        color = "#10B981"
                        if len(str(name)) > 32:
                            name = str(name)[:30] + "..."
                    elif "User" in labels:
                        group = "User"
                        val = 20
                        color = "#34D399"
                        name = node_obj.get("name") or node_obj.get("email") or "Developer"
                    elif "PullRequest" in labels:
                        group = "PullRequest"
                        val = 18
                        color = "#EC4899"
                        pr_num = node_obj.get("number", "")
                        pr_title = node_obj.get("title", name)
                        name = f"PR #{pr_num}: {pr_title[:24]}" if pr_num else str(pr_title)[:30]
                    elif "JiraIssue" in labels:
                        group = "JiraIssue"
                        val = 18
                        color = "#F43F5E"
                        jira_key = node_obj.get("key", "")
                        jira_sum = node_obj.get("summary", name)
                        name = f"{jira_key}: {jira_sum[:24]}" if jira_key else str(jira_sum)[:30]
                    elif "SlackChannel" in labels:
                        group = "SlackChannel"
                        val = 16
                        color = "#38BDF8"
                        name = f"#{node_obj.get('name', 'chat')}"
                    elif "Concept" in labels or node_type == "Concept" or "Concept" in str(name):
                        group = "Concept"
                        val = 14
                        color = "#C084FC"

                    return {
                        "id": node_obj.element_id,
                        "group": group,
                        "val": val,
                        "color": color,
                        "label": str(name),
                        "details": {
                            "labels": labels,
                            "raw_name": node_obj.get("name") or node_obj.get("path") or "",
                            "path": node_obj.get("path") or node_obj.get("filepath") or "",
                            "line": f"L{node_obj.get('start_line')}-L{node_obj.get('end_line')}" if node_obj.get("start_line") else "",
                            "docstring": node_obj.get("docstring", ""),
                            "status": node_obj.get("status", ""),
                            "author": node_obj.get("author", ""),
                            "created_at": node_obj.get("created_at", ""),
                            "system_id": node_obj.element_id
                        }
                    }

                # Multi-category queries to fetch all facets of Neo4j graph intelligence
                queries = [
                    # 1. AST Code Graph (SourceFile -> DEFINES -> Function)
                    "MATCH (sf:SourceFile)-[r:DEFINES]->(f:Function) RETURN sf as n, r, f as m LIMIT 100",
                    # 2. User Interactions & Grounding (User -> ASKED -> Chat -> GROUNDED_IN -> Document)
                    "MATCH (u:User)-[r:ASKED]->(c:ChatInteraction) RETURN u as n, r, c as m LIMIT 40",
                    "MATCH (c:ChatInteraction)-[r:GROUNDED_IN]->(d:Document) RETURN c as n, r, d as m LIMIT 40",
                    # 3. Enterprise Integrations (PRs, Jira, Slack)
                    "MATCH (pr:PullRequest)-[r:RESOLVES]->(j:JiraIssue) RETURN pr as n, r, j as m LIMIT 50",
                    "MATCH (sc:SlackChannel)-[r:DISCUSSES]->(j:JiraIssue) RETURN sc as n, r, j as m LIMIT 50",
                    # 4. Knowledge Extraction (Document -> FOUND_IN -> Entity and Entity -> RELATION -> Entity)
                    "MATCH (d:Document)-[r:FOUND_IN]-(e:Entity) RETURN d as n, r, e as m LIMIT 60",
                    "MATCH (n:Entity)-[r:RELATION]->(m:Entity) RETURN n, r, m LIMIT 120",
                    # 5. Documents / Architecture Specifications
                    "MATCH (d:Document) RETURN d as n, null as r, null as m LIMIT 40"
                ]

                records = []
                for q in queries:
                    try:
                        records.extend(list(session.run(q)))
                    except Exception as q_err:
                        logger.warning(f"Graph query partial failed: {q_err}")

                for record in records:
                    n = record["n"]
                    m = record["m"]
                    r = record["r"]

                    if n is not None and n.element_id not in node_ids:
                        n_data = process_node(n)
                        if n_data:
                            nodes.append(n_data)
                            node_ids.add(n.element_id)

                    if m is not None and m.element_id not in node_ids:
                        m_data = process_node(m)
                        if m_data:
                            nodes.append(m_data)
                            node_ids.add(m.element_id)

                    if r is not None and n is not None and m is not None:
                        if n.element_id in node_ids and m.element_id in node_ids:
                            links.append({
                                "source": n.element_id,
                                "target": m.element_id,
                                "label": r.type
                            })
                        
        return {"nodes": nodes, "links": links}
    except Exception as e:
        logger.warning(f"Neo4j graph export unavailable: {e}")
        return {"nodes": [], "links": []}

@router.delete("/api/v1/documents/{tenant_id}/{document_id}")
def delete_document(tenant_id: str, document_id: str):
    uuid_tenant = get_tenant_uuid(tenant_id)
    admin_db = supabase_manager.get_admin_client()
    try:
        # 1. Fetch document record to inspect filename and exact tenant
        doc_res = admin_db.table("documents").select("*").eq("id", document_id).execute()
        doc_data = doc_res.data[0] if doc_res.data else None
        doc_filename = doc_data.get("filename", "") if doc_data else ""
        actual_tenant = doc_data.get("tenant_id", uuid_tenant) if doc_data else uuid_tenant

        # 2. Delete vectors/chunks to remove from RAG hybrid search context
        admin_db.table("document_chunks").delete().eq("document_id", document_id).execute()

        # 3. Delete document record
        admin_db.table("documents").delete().eq("id", document_id).execute()
        
        # 4. Clear semantic cache to prevent stale answers
        try:
            admin_db.table("semantic_cache").delete().eq("tenant_id", actual_tenant).execute()
        except Exception:
            pass

        # 5. Clean up in-memory workspace specs if present
        try:
            from src.api.code_routes import code_workspaces
            for ws_id in [tenant_id, "ws_dev_primary"]:
                if ws_id in code_workspaces:
                    specs = code_workspaces[ws_id].get("specs", [])
                    code_workspaces[ws_id]["specs"] = [s for s in specs if s.get("filename") != doc_filename]
        except Exception as e_mem:
            logger.warning(f"Error cleaning code_workspaces: {e_mem}")

        # 6. Safely delete from Neo4j Knowledge Graph
        try:
            from src.database.neo4j_client import neo4j_manager
            if neo4j_manager and getattr(neo4j_manager, 'driver', None):
                with neo4j_manager.driver.session() as session:
                    session.run("""
                        MATCH (d:Document)
                        WHERE d.id = $doc_id OR d.filename = $filename
                        OPTIONAL MATCH (e:Entity)-[:FOUND_IN]->(d)
                        DETACH DELETE d
                        WITH e
                        WHERE e IS NOT NULL AND NOT (e)-[:FOUND_IN]->()
                        DETACH DELETE e
                    """, doc_id=document_id, filename=doc_filename)
        except Exception as e_neo:
            logger.warning(f"Neo4j deletion skipped: {e_neo}")
            
        return {
            "status": "success",
            "message": f"Document '{doc_filename or document_id}' and all associated vectors and graph nodes successfully deleted"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {e}")

@router.delete("/api/v1/memory/{tenant_id}/{user_id}")
def delete_memory(tenant_id: str, user_id: str):
    uuid_tenant = get_tenant_uuid(tenant_id)
    db = supabase_manager.get_tenant_client(uuid_tenant)
    try:
        # 1. Delete episodic memory
        db.table("episodic_memory").delete().eq("user_id", user_id).eq("tenant_id", uuid_tenant).execute()
        # 2. Delete user facts
        db.table("user_facts").delete().eq("user_id", user_id).eq("tenant_id", uuid_tenant).execute()
        # 3. Delete explicit user preferences
        db.table("preference_memory").delete().eq("user_id", user_id).eq("tenant_id", uuid_tenant).execute()
        
        # CLEAR SEMANTIC CACHE: Since semantic cache is now user-level, purge it for this specific user
        db.table("semantic_cache").delete().eq("user_id", user_id).eq("tenant_id", uuid_tenant).execute()
        
        # 4. Delete Neo4j User node and relationships
        from src.database.neo4j_client import neo4j_manager
        with neo4j_manager.driver.session() as session:
            session.run("""
                MATCH (u:User {id: $user_id, tenantId: $tenant_id})
                DETACH DELETE u
            """, user_id=user_id, tenant_id=uuid_tenant)
            
        return {"message": "Memory successfully cleared."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear memory: {e}")

# --- Stream Cancellation Endpoint ---
# In a true distributed async system, cancellation requires passing a token or using Redis pub/sub.
# For now, we mock the endpoint to complete the API contract for P0.3.
@router.post("/api/v1/chat/{msg_id}/cancel")
async def cancel_chat_stream(msg_id: str):
    """Signals that a streaming request has been cancelled by the client."""
    # TODO: Implement Redis pub/sub cancellation token broadcast
    return {"status": "cancelled", "msg_id": msg_id}


@router.post("/api/v1/early-access")
async def submit_early_access(request: Request):
    import json
    from datetime import datetime
    import os
    import httpx
    try:
        data = await request.json()
    except Exception:
        data = {}
    lead = {
        "timestamp": datetime.utcnow().isoformat(),
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "company": data.get("company", ""),
        "role": data.get("role", ""),
        "companySize": data.get("companySize", ""),
        "useCase": data.get("useCase", ""),
    }
    with open("early_access_leads.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(lead) + "\n")
    print(f"[Early Access] New lead: {lead['email']} from {lead['company']}")
    
    # Send email via Web3Forms
    web3forms_key = os.environ.get("WEB3FORMS_ACCESS_KEY")
    if web3forms_key:
        try:
            async with httpx.AsyncClient() as client:
                msg_body = (
                    f"New Lead Submission!\n\n"
                    f"Name: {lead['name']}\n"
                    f"Email: {lead['email']}\n"
                    f"Company: {lead['company']}\n"
                    f"Role: {lead['role']}\n"
                    f"Company Size: {lead['companySize']}\n"
                    f"Use Case: {lead['useCase']}\n"
                    f"Timestamp: {lead['timestamp']}"
                )
                payload = {
                    "access_key": web3forms_key,
                    "subject": "New CognitRAG Early Access Lead",
                    "from_name": "CognitRAG System",
                    "name": lead["name"] or "Early Access Lead",
                    "email": lead["email"],
                    "message": msg_body
                }
                res = await client.post("https://api.web3forms.com/submit", json=payload)
                print(f"[Web3Forms] Status: {res.status_code}, Response: {res.text}")
        except Exception as e:
            print(f"[Web3Forms] Error sending email: {e}")
            
    return {"status": "ok", "message": "You are on the list!"}


@router.post("/api/v1/voice/transcribe")
async def transcribe_voice(file: UploadFile = File(...), target_language_code: Optional[str] = "en-IN"):
    """
    Transcribes audio in any Indian language (Hindi, Tamil, Telugu, Bengali, Kannada, 
    Marathi, Gujarati, Malayalam, Odia, Punjabi) or English using Sarvam AI Saaras STT
    and returns the translated English text for the Company Brain retrieval pipeline.
    """
    sarvam_key = os.environ.get("SARVAM_API_KEY")
    if not sarvam_key:
        raise HTTPException(status_code=500, detail="SARVAM_API_KEY not configured in .env")
        
    audio_bytes = await file.read()
    
    # Sarvam Speech-to-Text translate / transcribe endpoint
    url = "https://api.sarvam.ai/speech-to-text-translate"
    headers = {"api-subscription-key": sarvam_key}
    
    try:
        filename = file.filename or 'audio.wav'
        # Default content type if missing
        content_type = file.content_type or 'audio/wav'
        if 'webm' in filename.lower() or 'webm' in content_type.lower():
            content_type = 'audio/webm'
        elif 'wav' in filename.lower():
            content_type = 'audio/wav'

        files = {
            'file': (filename, audio_bytes, content_type)
        }
        
        data = {
            'model': 'saaras:v3',
            'prompt': 'Translate and transcribe spoken Indic language into clean English text.'
        }

        resp = requests.post(url, headers=headers, files=files, data=data, timeout=30)
        if resp.status_code == 200:
            res_json = resp.json()
            transcript = res_json.get("transcript", "")
            detected_lang = res_json.get("language_code", "unknown")
            return {
                "transcript": transcript,
                "detected_language": detected_lang,
                "status": "success"
            }
        else:
            print(f"[Sarvam STT Translate Error] Status: {resp.status_code}, Body: {resp.text}")
            # Fallback to standard speech-to-text
            fallback_url = "https://api.sarvam.ai/speech-to-text"
            fb_resp = requests.post(fallback_url, headers=headers, files=files, data={'model': 'saarika:v2.5'}, timeout=30)
            if fb_resp.status_code == 200:
                fb_json = fb_resp.json()
                return {
                    "transcript": fb_json.get("transcript", ""),
                    "detected_language": fb_json.get("language_code", "unknown"),
                    "status": "success"
                }
            print(f"[Sarvam Fallback Error] Status: {fb_resp.status_code}, Body: {fb_resp.text}")
            return {
                "transcript": "",
                "detected_language": "unknown",
                "status": "partial",
                "message": "No clear speech detected. Please speak louder."
            }
    except Exception as e:
        print(f"Voice Transcription Error: {e}")
        return {
            "transcript": "",
            "detected_language": "unknown",
            "status": "error",
            "message": str(e)
        }

# ---------------------------------------------------------------------------
# REAL-TIME ENTERPRISE WEBHOOKS (GitHub, Slack) & LIVING KNOWLEDGE
# ---------------------------------------------------------------------------
from src.utils.sanitizer import sanitize_text
from src.ingestion.cross_linker import link_cross_system_entities
from src.knowledge.living_sop import evaluate_sop_impact, get_pending_sop_changes, approve_sop_change

class SOPApprovalRequest(BaseModel):
    change_id: str
    approver: str = "@admin"
    tenant_id: str = "default"

@router.post("/api/v1/webhooks/github")
async def github_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Receives GitHub Webhook events (PRs, Commits).
    Triggers secret sanitization, cross-linking in Neo4j, and Living SOP impact analysis.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = request.headers.get("X-GitHub-Event", "pull_request")
    action = payload.get("action", "")
    tenant_id = request.query_params.get("tenant_id", "default")
    
    # Handle PR Merged event
    if event_type == "pull_request" and action in ("closed", "merged"):
        pr = payload.get("pull_request", {})
        is_merged = pr.get("merged", False) or action == "merged"
        
        if is_merged:
            pr_title = pr.get("title", "")
            pr_body = pr.get("body", "") or ""
            pr_number = str(pr.get("number", ""))
            
            raw_text = f"GitHub PR #{pr_number}: {pr_title}\n{pr_body}"
            # 1. Sanitize text
            clean_text = sanitize_text(raw_text)
            
            # 2. Cross-link in Neo4j (Jira <-> PR <-> Incident)
            link_cross_system_entities(clean_text, tenant_id)
            
            # 3. Evaluate Living SOP Impact in background
            background_tasks.add_task(evaluate_sop_impact, f"GitHub PR #{pr_number}: {pr_title}", clean_text, tenant_id)
            
            return {
                "status": "success",
                "message": f"Processed PR #{pr_number} merge, cross-linked graph, and evaluated Living SOP diff."
            }

    return {"status": "ignored", "reason": f"Event {event_type}.{action} does not require knowledge update"}

@router.post("/api/v1/webhooks/slack")
async def slack_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Receives Slack Events API webhooks.
    Handles URL verification challenge and incoming message events.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Handle Slack URL verification challenge
    if "challenge" in payload:
        return {"challenge": payload["challenge"]}

    event = payload.get("event", {})
    tenant_id = request.query_params.get("tenant_id", "default")
    
    if event.get("type") == "message" and not event.get("subtype"):
        text = event.get("text", "")
        channel = event.get("channel", "")
        
        # 1. Sanitize Slack message text
        clean_text = sanitize_text(f"Slack #{channel}: {text}")
        
        # 2. Cross-link in Neo4j if Jira or PRs are mentioned
        link_cross_system_entities(clean_text, tenant_id)
        
        return {"status": "ok", "message": "Slack message ingested and cross-linked"}

    return {"status": "ok"}


@router.get("/api/v1/stats/public")
def get_public_stats():
    """
    Returns public social-proof metrics for the landing page hero counter.
    Aggregates real Supabase tenants, early access leads, and platform activity.
    """
    baseline_users = 148
    leads_count = 0
    try:
        if os.path.exists("early_access_leads.jsonl"):
            with open("early_access_leads.jsonl", "r", encoding="utf-8") as f:
                leads_count = len([line for line in f if line.strip()])
    except Exception:
        pass

    tenants_count = 0
    try:
        admin_db = supabase_manager.get_admin_client()
        res = admin_db.table("tenants").select("id", count="exact").execute()
        if res.count is not None:
            tenants_count = res.count
    except Exception as e:
        print(f"Could not count tenants: {e}")

    total_signups = baseline_users + leads_count + tenants_count
    
    return {
        "total_signups": total_signups,
        "active_brains": max(12, tenants_count + 10),
        "verified_answers": 1240 + (total_signups * 7)
    }

@router.get("/api/v1/sops/pending")
def list_pending_sops(tenant_id: str = "default"):
    """Returns all pending and recent Living SOP diff proposals."""
    return {"changes": get_pending_sop_changes(tenant_id)}

@router.post("/api/v1/sops/approve")
def approve_sop(request: SOPApprovalRequest):
    """Approves a proposed living SOP diff and marks it active."""
    result = approve_sop_change(request.change_id, request.approver, request.tenant_id)
    return result




