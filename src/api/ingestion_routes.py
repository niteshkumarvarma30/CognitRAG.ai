import uuid
import asyncio
import io
import zipfile
import requests
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from src.database.supabase_client import supabase_manager
from src.api.routes import get_tenant_uuid, background_ingestion_pipeline
from src.ingestion.parser import chunk_text
from src.ingestion.pipeline import run_ingestion_pipeline

router = APIRouter()

# In-memory job tracker for real-time frontend polling
ingestion_jobs = {}

class IngestGDriveRequest(BaseModel):
    tenant_id: str
    file_ids: List[str]

class IngestGithubRequest(BaseModel):
    tenant_id: str
    repo_names: List[str]

class IngestNotionRequest(BaseModel):
    tenant_id: str
    page_ids: List[str]

class IngestSlackRequest(BaseModel):
    tenant_id: str
    channel_ids: List[str]

class IngestJiraRequest(BaseModel):
    tenant_id: str
    project_keys: List[str]

def run_gdrive_sync_task(job_id: str, tenant_id: str, file_ids: List[str]):
    try:
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        admin_db.table("tenants").upsert({"id": uuid_tenant, "name": f"User {tenant_id}"}).execute()
        db = supabase_manager.get_tenant_client(uuid_tenant)
        
        token_resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "google_drive").execute()
        if not token_resp.data:
            ingestion_jobs[job_id]["status"] = "failed"
            ingestion_jobs[job_id]["error"] = "Google Drive not connected"
            return
            
        token = token_resp.data[0]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        ingestion_jobs[job_id]["status"] = "processing"
        
        for idx, file_id in enumerate(file_ids, 1):
            ingestion_jobs[job_id]["progress"] = f"Downloading file {idx}/{len(file_ids)} from Google Drive..."
            
            meta_res = requests.get(f"https://www.googleapis.com/drive/v3/files/{file_id}?fields=id,name,mimeType", headers=headers)
            if meta_res.status_code != 200:
                continue
            meta = meta_res.json()
            file_name = meta.get("name", f"gdrive_file_{file_id}")
            mime_type = meta.get("mimeType", "")
            
            if mime_type == "application/vnd.google-apps.document":
                d_res = requests.get(f"https://www.googleapis.com/drive/v3/files/{file_id}/export?mimeType=text/plain", headers=headers)
            else:
                d_res = requests.get(f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media", headers=headers)
                
            if d_res.status_code != 200:
                continue
                
            file_bytes = d_res.content
            
            doc_res = db.table("documents").insert({
                "tenant_id": uuid_tenant,
                "filename": f"gdrive/{file_name}",
                "status": "pending"
            }).execute()
            
            if doc_res.data:
                doc_id = doc_res.data[0]["id"]
                ingestion_jobs[job_id]["progress"] = f"Chunking & embedding {file_name} ({idx}/{len(file_ids)})..."
                background_ingestion_pipeline(uuid_tenant, doc_id, file_bytes, file_name)
                
        ingestion_jobs[job_id]["status"] = "completed"
        ingestion_jobs[job_id]["progress"] = f"Successfully ingested {len(file_ids)} Google Drive files into Supabase!"
    except Exception as e:
        ingestion_jobs[job_id]["status"] = "failed"
        ingestion_jobs[job_id]["error"] = str(e)

def run_github_sync_task(job_id: str, tenant_id: str, repo_names: List[str]):
    try:
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        admin_db.table("tenants").upsert({"id": uuid_tenant, "name": f"User {tenant_id}"}).execute()
        db = supabase_manager.get_tenant_client(uuid_tenant)
        
        token_resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "github").execute()
        if not token_resp.data:
            ingestion_jobs[job_id]["status"] = "failed"
            ingestion_jobs[job_id]["error"] = "GitHub not connected"
            return
            
        token = token_resp.data[0]["access_token"]
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github.v3+json"}
        
        ingestion_jobs[job_id]["status"] = "processing"
        
        for idx, repo_full in enumerate(repo_names, 1):
            ingestion_jobs[job_id]["progress"] = f"Cloning & parsing repo {repo_full} ({idx}/{len(repo_names)})..."
            zip_resp = requests.get(f"https://api.github.com/repos/{repo_full}/zipball", headers=headers, stream=True)
            if zip_resp.status_code != 200:
                continue
                
            with zipfile.ZipFile(io.BytesIO(zip_resp.content)) as z:
                for file_info in z.infolist():
                    if file_info.is_dir() or not (file_info.filename.endswith(".md") or file_info.filename.endswith(".txt")):
                        continue
                    if file_info.file_size > 1_000_000:
                        continue
                        
                    file_bytes = z.read(file_info.filename)
                    clean_filename = f"github/{repo_full}/{file_info.filename.split('/', 1)[-1]}"
                    
                    doc_res = db.table("documents").insert({
                        "tenant_id": uuid_tenant,
                        "filename": clean_filename,
                        "status": "pending"
                    }).execute()
                    
                    if doc_res.data:
                        doc_id = doc_res.data[0]["id"]
                        background_ingestion_pipeline(uuid_tenant, doc_id, file_bytes, clean_filename)
                        
        ingestion_jobs[job_id]["status"] = "completed"
        ingestion_jobs[job_id]["progress"] = f"Successfully ingested {len(repo_names)} GitHub repositories into Supabase!"
    except Exception as e:
        ingestion_jobs[job_id]["status"] = "failed"
        ingestion_jobs[job_id]["error"] = str(e)

def run_notion_sync_task(job_id: str, tenant_id: str, page_ids: List[str]):
    try:
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        admin_db.table("tenants").upsert({"id": uuid_tenant, "name": f"User {tenant_id}"}).execute()
        db = supabase_manager.get_tenant_client(uuid_tenant)
        
        token_resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "notion").execute()
        if not token_resp.data:
            ingestion_jobs[job_id]["status"] = "failed"
            ingestion_jobs[job_id]["error"] = "Notion not connected"
            return
            
        token = token_resp.data[0]["access_token"]
        headers = {
            "Authorization": f"Bearer {token}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
        
        ingestion_jobs[job_id]["status"] = "processing"
        
        for idx, page_id in enumerate(page_ids, 1):
            ingestion_jobs[job_id]["progress"] = f"Extracting Notion page {idx}/{len(page_ids)}..."
            
            blocks_res = requests.get(f"https://api.notion.com/v1/blocks/{page_id}/children", headers=headers)
            blocks = blocks_res.json().get("results", []) if blocks_res.status_code == 200 else []
            
            page_text = f"# Notion Document {page_id}\n\n"
            for b in blocks:
                b_type = b.get("type", "")
                if b_type in b and "rich_text" in b[b_type]:
                    for rt in b[b_type]["rich_text"]:
                        page_text += rt.get("plain_text", "")
                    page_text += "\n\n"
                    
            doc_res = db.table("documents").insert({
                "tenant_id": uuid_tenant,
                "filename": f"notion/page_{page_id}.md",
                "status": "pending"
            }).execute()
            
            if doc_res.data:
                doc_id = doc_res.data[0]["id"]
                chunks = chunk_text(page_text)
                run_ingestion_pipeline(uuid_tenant, doc_id, chunks)
                db.table("documents").update({"status": "completed"}).eq("id", doc_id).execute()
                
        ingestion_jobs[job_id]["status"] = "completed"
        ingestion_jobs[job_id]["progress"] = f"Successfully ingested {len(page_ids)} Notion pages into Supabase!"
    except Exception as e:
        ingestion_jobs[job_id]["status"] = "failed"
        ingestion_jobs[job_id]["error"] = str(e)

def run_slack_sync_task(job_id: str, tenant_id: str, channel_ids: List[str]):
    try:
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        admin_db.table("tenants").upsert({"id": uuid_tenant, "name": f"User {tenant_id}"}).execute()
        db = supabase_manager.get_tenant_client(uuid_tenant)
        
        token_resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "slack").execute()
        if not token_resp.data:
            ingestion_jobs[job_id]["status"] = "failed"
            ingestion_jobs[job_id]["error"] = "Slack not connected"
            return
            
        token = token_resp.data[0]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        ingestion_jobs[job_id]["status"] = "processing"
        
        for idx, ch_id in enumerate(channel_ids, 1):
            ingestion_jobs[job_id]["progress"] = f"Fetching messages from Slack channel {ch_id} ({idx}/{len(channel_ids)})..."
            
            hist_res = requests.get("https://slack.com/api/conversations.history", headers=headers, params={"channel": ch_id, "limit": 100})
            msgs = hist_res.json().get("messages", []) if hist_res.status_code == 200 and hist_res.json().get("ok") else []
            
            ch_text = f"# Slack Channel {ch_id}\n\n"
            for m in reversed(msgs):
                user = m.get("user", "User")
                text = m.get("text", "")
                ch_text += f"- **{user}**: {text}\n"
                
            doc_res = db.table("documents").insert({
                "tenant_id": uuid_tenant,
                "filename": f"slack/channel_{ch_id}.md",
                "status": "pending"
            }).execute()
            
            if doc_res.data:
                doc_id = doc_res.data[0]["id"]
                chunks = chunk_text(ch_text)
                run_ingestion_pipeline(uuid_tenant, doc_id, chunks)
                db.table("documents").update({"status": "completed"}).eq("id", doc_id).execute()
                
        ingestion_jobs[job_id]["status"] = "completed"
        ingestion_jobs[job_id]["progress"] = f"Successfully ingested {len(channel_ids)} Slack channels into Supabase!"
    except Exception as e:
        ingestion_jobs[job_id]["status"] = "failed"
        ingestion_jobs[job_id]["error"] = str(e)

def run_jira_sync_task(job_id: str, tenant_id: str, project_keys: List[str]):
    try:
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        admin_db.table("tenants").upsert({"id": uuid_tenant, "name": f"User {tenant_id}"}).execute()
        db = supabase_manager.get_tenant_client(uuid_tenant)
        
        token_resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "jira").execute()
        if not token_resp.data:
            ingestion_jobs[job_id]["status"] = "failed"
            ingestion_jobs[job_id]["error"] = "Jira not connected"
            return
            
        token = token_resp.data[0]["access_token"]
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        
        res_resp = requests.get("https://api.atlassian.com/oauth/token/accessible-resources", headers=headers)
        if res_resp.status_code != 200 or not res_resp.json():
            ingestion_jobs[job_id]["status"] = "failed"
            ingestion_jobs[job_id]["error"] = "No accessible Jira resources found"
            return
            
        cloud_id = res_resp.json()[0]["id"]
        ingestion_jobs[job_id]["status"] = "processing"
        
        for idx, key in enumerate(project_keys, 1):
            ingestion_jobs[job_id]["progress"] = f"Fetching issues from Jira project {key} ({idx}/{len(project_keys)})..."
            
            s_res = requests.post(
                f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/search",
                headers=headers,
                json={"jql": f"project = '{key}' ORDER BY updated DESC", "maxResults": 50}
            )
            
            issues = s_res.json().get("issues", []) if s_res.status_code == 200 else []
            
            jira_text = f"# Jira Project {key}\n\n"
            for iss in issues:
                f = iss.get("fields", {})
                summary = f.get("summary", "No Summary")
                status = f.get("status", {}).get("name", "Open")
                jira_text += f"## [{iss.get('key')}] {summary}\n- Status: {status}\n\n"
                
            doc_res = db.table("documents").insert({
                "tenant_id": uuid_tenant,
                "filename": f"jira/project_{key}.md",
                "status": "pending"
            }).execute()
            
            if doc_res.data:
                doc_id = doc_res.data[0]["id"]
                chunks = chunk_text(jira_text)
                run_ingestion_pipeline(uuid_tenant, doc_id, chunks)
                db.table("documents").update({"status": "completed"}).eq("id", doc_id).execute()
                
        ingestion_jobs[job_id]["status"] = "completed"
        ingestion_jobs[job_id]["progress"] = f"Successfully ingested {len(project_keys)} Jira projects into Supabase!"
    except Exception as e:
        ingestion_jobs[job_id]["status"] = "failed"
        ingestion_jobs[job_id]["error"] = str(e)

@router.post("/api/v1/ingest/gdrive")
def ingest_gdrive(req: IngestGDriveRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    ingestion_jobs[job_id] = {
        "status": "pending",
        "progress": "Queued for processing...",
        "total": len(req.file_ids)
    }
    background_tasks.add_task(run_gdrive_sync_task, job_id, req.tenant_id, req.file_ids)
    return {"job_id": job_id, "status": "queued"}

@router.post("/api/v1/ingest/github")
def ingest_github(req: IngestGithubRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    ingestion_jobs[job_id] = {
        "status": "pending",
        "progress": "Queued for processing...",
        "total": len(req.repo_names)
    }
    background_tasks.add_task(run_github_sync_task, job_id, req.tenant_id, req.repo_names)
    return {"job_id": job_id, "status": "queued"}

@router.post("/api/v1/ingest/notion")
def ingest_notion(req: IngestNotionRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    ingestion_jobs[job_id] = {
        "status": "pending",
        "progress": "Queued for processing...",
        "total": len(req.page_ids)
    }
    background_tasks.add_task(run_notion_sync_task, job_id, req.tenant_id, req.page_ids)
    return {"job_id": job_id, "status": "queued"}

@router.post("/api/v1/ingest/slack")
def ingest_slack(req: IngestSlackRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    ingestion_jobs[job_id] = {
        "status": "pending",
        "progress": "Queued for processing...",
        "total": len(req.channel_ids)
    }
    background_tasks.add_task(run_slack_sync_task, job_id, req.tenant_id, req.channel_ids)
    return {"job_id": job_id, "status": "queued"}

@router.post("/api/v1/ingest/jira")
def ingest_jira(req: IngestJiraRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    ingestion_jobs[job_id] = {
        "status": "pending",
        "progress": "Queued for processing...",
        "total": len(req.project_keys)
    }
    background_tasks.add_task(run_jira_sync_task, job_id, req.tenant_id, req.project_keys)
    return {"job_id": job_id, "status": "queued"}

@router.get("/api/v1/ingest/status/{job_id}")
def get_ingest_status(job_id: str):
    if job_id not in ingestion_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return ingestion_jobs[job_id]
