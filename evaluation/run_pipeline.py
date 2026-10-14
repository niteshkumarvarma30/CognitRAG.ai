import os
import requests
from typing import Dict, Any, Optional
from Evaluation.schema import EvalExample

COGNITRAG_API_BASE = os.environ.get("COGNITRAG_API_BASE", "http://localhost:8000")
EVAL_TENANT_ID = os.environ.get("EVAL_TENANT_ID", "e0a10000-0000-4000-8000-000000000001")

_SERVER_AVAILABLE = None

def check_server(api_base: str) -> bool:
    global _SERVER_AVAILABLE
    if _SERVER_AVAILABLE is not None:
        return _SERVER_AVAILABLE
    try:
        resp = requests.get(f"{api_base}/health", timeout=0.5)
        _SERVER_AVAILABLE = (resp.status_code == 200)
    except Exception:
        _SERVER_AVAILABLE = False
    return _SERVER_AVAILABLE

def run_example(example: EvalExample, api_base: str = COGNITRAG_API_BASE) -> Dict[str, Any]:
    """
    Executes an EvalExample through CognitRAG.
    - If task_type == 'language_id': evaluates language detector directly.
    - If task_type in ('qa', 'citation', 'hallucination', 'contradiction'):
      tries HTTP /api/v1/chat first if server is reachable; falls back to in-process CRAG LangGraph execution.
    """
    # 1. Fast path for Language Identification benchmarks (COMI-LINGUA)
    if example.task_type == "language_id":
        from src.ingestion.language_detector import detect_language
        detected = detect_language(example.input_query or "")
        return {
            "task_type": "language_id",
            "detected_language": detected,
            "is_correct": detected == example.gold_label,
            "gold_label": example.gold_label
        }

    # 2. HTTP Endpoint Path (only if server is running)
    if check_server(api_base):
        payload = {
            "tenant_id": EVAL_TENANT_ID,
            "message": example.input_query or "",
            "user_id": "eval_runner"
        }
        if example.input_context:
            payload["context_override"] = example.input_context

        try:
            resp = requests.post(f"{api_base}/api/v1/chat", json=payload, timeout=20)
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            pass

    # 3. In-Process LangGraph Fallback Path
    try:
        from src.retrieval.graph import crag_app
        from src.ingestion.language_detector import detect_language
        from src.ingestion.contradiction_detector import check_conflicts

        detected_lang = detect_language(example.input_query or "")
        initial_state = {
            "tenant_id": EVAL_TENANT_ID,
            "user_id": "eval_runner",
            "question": example.input_query or "",
            "generation": "",
            "documents": example.input_context or "",
            "route": "",
            "chat_history": [],
            "query_language": detected_lang
        }
        final_state = crag_app.invoke(initial_state)
        raw_docs = final_state.get("raw_documents", []) or final_state.get("evidence", [])
        
        citations = []
        if isinstance(raw_docs, list):
            for doc in raw_docs:
                if isinstance(doc, dict):
                    citations.append({
                        "chunk_id": str(doc.get("id", doc.get("ref", "")))[:12],
                        "source_type": doc.get("source_type", doc.get("type", "document")),
                        "confidence": float(doc.get("similarity", doc.get("confidence", 0.85))),
                        "derivation": doc.get("derivation", "extracted"),
                        "snippet": str(doc.get("content", ""))[:200]
                    })

        contradictions = check_conflicts(EVAL_TENANT_ID, raw_docs) if isinstance(raw_docs, list) else []

        return {
            "answer": final_state.get("generation", ""),
            "citations": citations,
            "contradictions": contradictions,
            "language_detected": detected_lang,
            "graph_context": final_state.get("graph_context", ""),
            "audit_trail": final_state.get("audit_trail", [])
        }
    except Exception as err:
        return {"error": str(err), "answer": "", "citations": [], "graph_context": ""}
