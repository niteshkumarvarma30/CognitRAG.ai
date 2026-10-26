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

from src.api.job_tracker import ingestion_jobs

class IngestGDriveRequest(BaseModel):
    tenant_id: str
    file_ids: List[str]

class IngestGithubRequest(BaseModel):
    tenant_id: str
    repo_names: Optional[List[str]] = None
    repo_full_name: Optional[str] = None

class IngestNotionRequest(BaseModel):
    tenant_id: str
    page_ids: Optional[List[str]] = None
    page_id: Optional[str] = None
    page_title: Optional[str] = None

class IngestSlackRequest(BaseModel):
    tenant_id: str
    channel_ids: Optional[List[str]] = None
    channel_id: Optional[str] = None
    channel_name: Optional[str] = None

class IngestJiraRequest(BaseModel):
    tenant_id: str
    project_keys: Optional[List[str]] = None
    project_key: Optional[str] = None

def run_gdrive_sync_task(job_id: str, tenant_id: str, file_ids: List[str]):
    try:
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        admin_db.table("tenants").upsert({"id": uuid_tenant, "name": f"User {tenant_id}"}).execute()
        db = admin_db
        
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
        db = admin_db
        
        token_resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "github").execute()
        if not token_resp.data:
            ingestion_jobs[job_id]["status"] = "failed"
            ingestion_jobs[job_id]["error"] = "GitHub not connected"
            return
            
        token = token_resp.data[0]["access_token"]
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github.v3+json"}
        
        ingestion_jobs[job_id]["status"] = "processing"
        
        for idx, repo_full in enumerate(repo_names, 1):
            ingestion_jobs[job_id]["progress"] = f"Cloning & scanning {repo_full} ({idx}/{len(repo_names)})..."
            zip_resp = requests.get(f"https://api.github.com/repos/{repo_full}/zipball", headers=headers, stream=True)
            if zip_resp.status_code != 200:
                print(f"Failed to fetch zipball for {repo_full}: {zip_resp.status_code}")
                continue
                
            ingested_files_count = 0
            MAX_FILES_PER_REPO = 50  # Protect Bedrock/Titan model rate limits

            with zipfile.ZipFile(io.BytesIO(zip_resp.content)) as z:
                # Prioritize architecture, spec, and Titan documents first
                def file_priority(info):
                    p_low = info.filename.lower()
                    if any(k in p_low for k in ['titan', 'architecture', 'spec', 'readme', 'adr', 'decision']):
                        return 0
                    return 1

                sorted_files = sorted(z.infolist(), key=file_priority)

                for file_info in sorted_files:
                    if ingested_files_count >= MAX_FILES_PER_REPO:
                        break

                    path_lower = file_info.filename.lower()
                    
                    # 1. Strictly ignore build, dependencies, and lockfiles
                    if any(ignored in path_lower for ignored in [
                        '/node_modules/', '/vendor/', '/dist/', '/build/', '/.next/',
                        '/.git/', '/__pycache__/', 'package-lock.json', 'yarn.lock',
                        'poetry.lock', 'cargo.lock', '/__snapshots__/'
                    ]):
                        continue

                    # 2. Filter for Golden Knowledge Assets: Docs, ADRs, READMEs, Schemas
                    is_doc = path_lower.endswith(('.md', '.txt'))
                    is_schema = any(s in path_lower for s in ['openapi', 'swagger', 'schema.graphql']) and path_lower.endswith(('.yaml', '.yml', '.json'))
                    is_adr = ('/adr/' in path_lower or '/decisions/' in path_lower) and path_lower.endswith(('.md', '.txt'))

                    if not (is_doc or is_schema or is_adr):
                        continue

                    if file_info.file_size > 1_000_000:
                        continue
                        
                    file_bytes = z.read(file_info.filename)
                    clean_filename = f"github/{repo_full}/{file_info.filename.split('/', 1)[-1]}"
                    
                    ingestion_jobs[job_id]["progress"] = f"Ingesting {clean_filename.split('/')[-1]} ({ingested_files_count+1}/{MAX_FILES_PER_REPO})..."

                    doc_res = db.table("documents").insert({
                        "tenant_id": uuid_tenant,
                        "filename": clean_filename,
                        "status": "pending"
                    }).execute()
                    
                    if doc_res.data:
                        doc_id = doc_res.data[0]["id"]
                        background_ingestion_pipeline(uuid_tenant, doc_id, file_bytes, clean_filename)
                        ingested_files_count += 1
                        
        ingestion_jobs[job_id]["status"] = "completed"
        ingestion_jobs[job_id]["progress"] = f"Successfully synced GitHub documentation and architecture decisions!"
    except Exception as e:
        ingestion_jobs[job_id]["status"] = "failed"
        ingestion_jobs[job_id]["error"] = str(e)

def run_notion_sync_task(job_id: str, tenant_id: str, page_ids: List[str]):
    try:
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        admin_db.table("tenants").upsert({"id": uuid_tenant, "name": f"User {tenant_id}"}).execute()
        db = admin_db
        
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
            
            page_meta_res = requests.get(f"https://api.notion.com/v1/pages/{page_id}", headers=headers)
            page_title = "Notion Document"
            if page_meta_res.status_code == 200:
                props = page_meta_res.json().get("properties", {})
                for p_key, p_val in props.items():
                    if p_val.get("type") == "title" and p_val.get("title"):
                        extracted_title = "".join(t.get("plain_text", "") for t in p_val.get("title", []))
                        if extracted_title.strip():
                            page_title = extracted_title.strip()
                        break

            page_text = f"# {page_title}\n\n"
            for b in blocks:
                b_type = b.get("type", "")
                if b_type in b and "rich_text" in b[b_type]:
                    block_content = "".join(rt.get("plain_text", "") for rt in b[b_type]["rich_text"])
                    if not block_content.strip():
                        continue
                    if b_type == "heading_1":
                        page_text += f"## {block_content}\n\n"
                    elif b_type == "heading_2":
                        page_text += f"### {block_content}\n\n"
                    elif b_type == "bulleted_list_item":
                        page_text += f"- {block_content}\n\n"
                    else:
                        page_text += f"{block_content}\n\n"
                    
            doc_res = db.table("documents").insert({
                "tenant_id": uuid_tenant,
                "filename": f"notion/page_{page_id}.md",
                "status": "pending"
            }).execute()
            
            if doc_res.data:
                doc_id = doc_res.data[0]["id"]
                chunks = chunk_text(page_text)
                run_ingestion_pipeline(uuid_tenant, doc_id, chunks, source_type="notion", author="Notion Workspace")
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
        db = admin_db
        
        token_resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "slack").execute()
        if not token_resp.data:
            ingestion_jobs[job_id]["status"] = "failed"
            ingestion_jobs[job_id]["error"] = "Slack not connected"
            return
            
        token = token_resp.data[0]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        ingestion_jobs[job_id]["status"] = "processing"
        
        for idx, ch_id in enumerate(channel_ids, 1):
            info_res = requests.get("https://slack.com/api/conversations.info", headers=headers, params={"channel": ch_id})
            ch_name = ch_id
            if info_res.status_code == 200 and info_res.json().get("ok"):
                ch_name = info_res.json().get("channel", {}).get("name", ch_id)

            ingestion_jobs[job_id]["progress"] = f"Fetching messages from #{ch_name} ({idx}/{len(channel_ids)})..."
            
            hist_res = requests.get("https://slack.com/api/conversations.history", headers=headers, params={"channel": ch_id, "limit": 100})
            msgs = hist_res.json().get("messages", []) if hist_res.status_code == 200 and hist_res.json().get("ok") else []
            
            ch_text = f"# Slack Channel #{ch_name}\n\n"
            for m in reversed(msgs):
                user = m.get("user", "User")
                text = m.get("text", "")
                if not text.strip():
                    continue
                ch_text += f"- **{user}**: {text}\n"
                
                # Fetch thread replies if thread exists
                if m.get("reply_count", 0) > 0 and m.get("ts"):
                    rep_res = requests.get("https://slack.com/api/conversations.replies", headers=headers, params={"channel": ch_id, "ts": m["ts"]})
                    if rep_res.status_code == 200 and rep_res.json().get("ok"):
                        for rep in rep_res.json().get("messages", [])[1:]:
                            r_user = rep.get("user", "User")
                            r_text = rep.get("text", "")
                            if r_text.strip():
                                ch_text += f"  - [Thread Reply by {r_user}]: {r_text}\n"
                ch_text += "\n"
                
            doc_res = db.table("documents").insert({
                "tenant_id": uuid_tenant,
                "filename": f"slack/{ch_name}.md",
                "status": "pending"
            }).execute()
            
            if doc_res.data:
                doc_id = doc_res.data[0]["id"]
                chunks = chunk_text(ch_text)
                run_ingestion_pipeline(uuid_tenant, doc_id, chunks, source_type="slack", author=f"#{ch_name}")
                db.table("documents").update({"status": "completed"}).eq("id", doc_id).execute()
                
        ingestion_jobs[job_id]["status"] = "completed"
        ingestion_jobs[job_id]["progress"] = f"Successfully ingested {len(channel_ids)} Slack channels into Supabase!"
    except Exception as e:
        ingestion_jobs[job_id]["status"] = "failed"
        ingestion_jobs[job_id]["error"] = str(e)

def extract_jira_adf_text(node):
    if not node:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return "\n".join([extract_jira_adf_text(item) for item in node if item]).strip()
    if isinstance(node, dict):
        t = node.get("text", "")
        node_type = node.get("type", "")
        if "content" in node:
            inner = extract_jira_adf_text(node["content"])
            if t:
                t = f"{t} {inner}"
            else:
                t = inner
        if node_type == "listItem":
            return f"- {t}"
        elif node_type.startswith("heading"):
            return f"\n### {t}\n"
        elif node_type == "paragraph":
            return f"{t}\n"
        return t
    return ""

def run_jira_sync_task(job_id: str, tenant_id: str, project_keys: List[str]):
    try:
        uuid_tenant = get_tenant_uuid(tenant_id)
        admin_db = supabase_manager.get_admin_client()
        admin_db.table("tenants").upsert({"id": uuid_tenant, "name": f"User {tenant_id}"}).execute()
        db = admin_db
        
        token_resp = admin_db.table("tenant_integrations").select("access_token").eq("tenant_id", uuid_tenant).eq("integration_type", "jira").execute()
        if not token_resp.data:
            ingestion_jobs[job_id]["status"] = "failed"
            ingestion_jobs[job_id]["error"] = "Jira not connected"
            return
            
        token = token_resp.data[0]["access_token"]
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json", "Content-Type": "application/json"}
        
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
                f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/search/jql",
                headers=headers,
                json={
                    "jql": f"project = '{key}' ORDER BY updated DESC",
                    "maxResults": 50,
                    "fields": ["summary", "status", "description", "assignee", "priority"]
                }
            )
            
            issues = s_res.json().get("issues", []) if s_res.status_code == 200 else []
            
            jira_text = f"# Jira Project {key}\n\n"
            for iss in issues:
                f = iss.get("fields", {})
                summary = f.get("summary", "No Summary")
                status = f.get("status", {}).get("name", "Open")
                assignee = f.get("assignee", {}).get("displayName", "Unassigned") if f.get("assignee") else "Unassigned"
                priority = f.get("priority", {}).get("name", "Normal") if f.get("priority") else "Normal"
                desc = extract_jira_adf_text(f.get("description"))
                
                jira_text += f"## [{iss.get('key')}] {summary}\n"
                jira_text += f"- **Status**: {status}\n"
                jira_text += f"- **Assignee**: {assignee}\n"
                jira_text += f"- **Priority**: {priority}\n\n"
                if desc:
                    jira_text += f"### Details & Acceptance Criteria\n{desc}\n\n"
                
            doc_res = db.table("documents").insert({
                "tenant_id": uuid_tenant,
                "filename": f"jira/project_{key}.md",
                "status": "pending"
            }).execute()
            
            if doc_res.data:
                doc_id = doc_res.data[0]["id"]
                chunks = chunk_text(jira_text)
                run_ingestion_pipeline(
                    uuid_tenant,
                    doc_id,
                    chunks,
                    source_type="jira",
                    author="Jira Sync"
                )
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
    repos = req.repo_names or ([req.repo_full_name] if req.repo_full_name else [])
    job_id = str(uuid.uuid4())
    ingestion_jobs[job_id] = {
        "status": "pending",
        "progress": "Queued for processing...",
        "total": len(repos)
    }
    background_tasks.add_task(run_github_sync_task, job_id, req.tenant_id, repos)
    return {"job_id": job_id, "status": "queued", "message": f"Successfully queued {len(repos)} GitHub repositories for ingestion."}

@router.post("/api/v1/ingest/notion")
def ingest_notion(req: IngestNotionRequest, background_tasks: BackgroundTasks):
    pages = req.page_ids or ([req.page_id] if req.page_id else [])
    job_id = str(uuid.uuid4())
    ingestion_jobs[job_id] = {
        "status": "pending",
        "progress": "Queued for processing...",
        "total": len(pages)
    }
    background_tasks.add_task(run_notion_sync_task, job_id, req.tenant_id, pages)
    return {"job_id": job_id, "status": "queued", "message": f"Successfully queued {len(pages)} Notion pages for ingestion."}

@router.post("/api/v1/ingest/slack")
def ingest_slack(req: IngestSlackRequest, background_tasks: BackgroundTasks):
    channels = req.channel_ids or ([req.channel_id] if req.channel_id else [])
    channel_display = req.channel_name or (channels[0] if channels else "channels")
    job_id = str(uuid.uuid4())
    ingestion_jobs[job_id] = {
        "status": "pending",
        "progress": "Queued for processing...",
        "total": len(channels)
    }
    background_tasks.add_task(run_slack_sync_task, job_id, req.tenant_id, channels)
    return {"job_id": job_id, "status": "queued", "message": f"Successfully queued {channel_display} for ingestion."}

@router.post("/api/v1/ingest/jira")
def ingest_jira(req: IngestJiraRequest, background_tasks: BackgroundTasks):
    projects = req.project_keys or ([req.project_key] if req.project_key else [])
    job_id = str(uuid.uuid4())
    ingestion_jobs[job_id] = {
        "status": "pending",
        "progress": "Queued for processing...",
        "total": len(projects)
    }
    background_tasks.add_task(run_jira_sync_task, job_id, req.tenant_id, projects)
    return {"job_id": job_id, "status": "queued", "message": f"Successfully queued {len(projects)} Jira projects for ingestion."}

@router.get("/api/v1/ingest/status/{job_id}")
def get_ingest_status(job_id: str):
    if job_id not in ingestion_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return ingestion_jobs[job_id]
