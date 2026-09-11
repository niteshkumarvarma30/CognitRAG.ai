"""
Shared in-memory job tracker for asynchronous ingestion and sync tasks.
Supports 1,000 concurrent users via non-blocking job queuing, progress polling,
and concurrency throttling with asyncio.Semaphore.
"""

import time
import uuid
import asyncio
from typing import Dict, Any, Optional

# Global jobs store: job_id -> job_metadata
ingestion_jobs: Dict[str, Dict[str, Any]] = {}

# Concurrency throttle: max 2 heavy ingestion tasks run simultaneously across all users
# Remaining tasks stay in "queued" status with transparent queue position tracking
code_ingestion_semaphore = asyncio.Semaphore(2)

def create_job(workspace_id: str, job_type: str, filename: str, details: Optional[Dict[str, Any]] = None) -> str:
    """
    Initializes a new ingestion job in the 'queued' state.
    """
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    now = time.time()
    
    # Calculate queue position among currently active/queued jobs
    queued_count = sum(1 for j in ingestion_jobs.values() if j.get("status") in ("queued", "processing"))
    
    ingestion_jobs[job_id] = {
        "job_id": job_id,
        "workspace_id": workspace_id,
        "job_type": job_type,
        "filename": filename,
        "status": "queued",
        "progress_pct": 0,
        "current_step": "Waiting in queue...",
        "queue_position": queued_count + 1,
        "created_at": now,
        "updated_at": now,
        "details": details or {},
        "error": None
    }
    return job_id

def update_job(
    job_id: str, 
    status: Optional[str] = None, 
    progress_pct: Optional[int] = None, 
    current_step: Optional[str] = None, 
    details: Optional[Dict[str, Any]] = None, 
    error: Optional[str] = None
):
    """
    Updates the state, progress, and logs of an ongoing ingestion job.
    """
    if job_id not in ingestion_jobs:
        return
    
    job = ingestion_jobs[job_id]
    job["updated_at"] = time.time()
    
    if status is not None:
        job["status"] = status
    if progress_pct is not None:
        job["progress_pct"] = min(100, max(0, progress_pct))
    if current_step is not None:
        job["current_step"] = current_step
    if details is not None:
        job["details"].update(details)
    if error is not None:
        job["error"] = error
        job["status"] = "failed"

def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves the job metadata and dynamically recalibrates queue position.
    """
    job = ingestion_jobs.get(job_id)
    if not job:
        return None
    
    # Dynamically compute remaining ahead in queue if still queued
    if job["status"] == "queued":
        ahead = sum(
            1 for j in ingestion_jobs.values() 
            if j.get("status") == "queued" and j.get("created_at", 0) < job.get("created_at", 0)
        )
        job["queue_position"] = ahead + 1
    else:
        job["queue_position"] = 0
        
    return job
