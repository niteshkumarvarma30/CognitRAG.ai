from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router as main_router
from src.api.memory_routes import router as memory_router
from src.api.integration_routes import router as integration_router
from src.api.ingestion_routes import router as ingestion_router
from src.api.workspace_routes import router as workspace_router
from src.api.security_routes import router as security_router
from src.api.billing_routes import router as billing_router
from src.api.admin_routes import router as admin_router
from src.api.bot_routes import router as bot_router
from src.api.webhooks import router as webhooks_router
from src.api.audit import router as audit_router
from src.api.sources import router as sources_router
from src.api.feedback import router as feedback_router
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title="CognitRAG v5 API",
    description="Multilingual GraphRAG Company Brain — Permission-aware retrieval, fail-closed security, and citation audit",
    version="5.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workspace_router)
app.include_router(security_router)
app.include_router(billing_router)
app.include_router(main_router)
app.include_router(memory_router)
app.include_router(ingestion_router)
app.include_router(integration_router)
app.include_router(admin_router)
app.include_router(bot_router)
app.include_router(webhooks_router)
app.include_router(audit_router)
app.include_router(sources_router)
app.include_router(feedback_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "CognitRAG v2 — Company Brain",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
