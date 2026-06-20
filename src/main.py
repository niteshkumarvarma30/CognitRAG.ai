from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.api.routes import router as main_router
from src.api.memory_routes import router as memory_router
import os

import mlflow
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing MLflow...")
    mlflow.set_tracking_uri("sqlite:///mlflow.db")
    # Removed setting the deleted experiment to prevent startup crashes
    
    # Disable autologging during batch evaluation to prevent 15-minute delays
    # mlflow.langchain.autolog()
    yield

app = FastAPI(title="Hybrid RAG SaaS API", lifespan=lifespan)

# Add CORS so the widget can be embedded on any external customer domain securely
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(main_router)
app.include_router(memory_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Hybrid RAG SaaS"}

# Mount public directory for serving the widget locally
os.makedirs("src/public", exist_ok=True)
app.mount("/", StaticFiles(directory="src/public", html=True), name="public")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
