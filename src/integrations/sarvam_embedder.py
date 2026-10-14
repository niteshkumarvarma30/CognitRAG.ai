"""
CognitRAG v2 — Sarvam Embedder
Wraps the Sarvam AI embedding API for Hinglish/multilingual content.
Falls back to intfloat/multilingual-e5 via NVIDIA NIM if Sarvam unavailable.
"""
import os
import requests
from openai import OpenAI

# Sarvam API (uses OpenAI-compatible interface)
SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY", "")
SARVAM_BASE_URL = "https://api.sarvam.ai/v1"

# Fallback: multilingual-e5 via NVIDIA NIM
NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY", "")
NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

# Embedding dimension for multilingual models
# Sarvam: 768-dim, multilingual-e5-large: 1024-dim
# We use 1024 to match Supabase vector(1024) column
EMBED_DIM = 1024


def sarvam_embed(texts: list[str]) -> list[list[float]]:
    """
    Embed a list of Hinglish/multilingual texts using Sarvam AI.
    Falls back to NVIDIA multilingual-e5 if Sarvam fails.
    Returns list of embedding vectors.
    """
    if not isinstance(texts, list):
        texts = [texts]

    # Try Sarvam first
    if SARVAM_API_KEY:
        try:
            return _sarvam_embed_batch(texts)
        except Exception as e:
            print(f"[Sarvam Embed] Failed: {e}. Falling back to multilingual-e5...")

    # Fallback to NVIDIA multilingual-e5
    if NVIDIA_API_KEY:
        try:
            return _nvidia_multilingual_embed(texts)
        except Exception as e:
            print(f"[NVIDIA Embed] Failed: {e}. Falling back to Titan...")

    # Final fallback to Titan (English-only, not ideal for Hinglish)
    print("[Warning] No multilingual embedder available. Using Titan (English-only).")
    return _titan_embed_fallback(texts)


def sarvam_embed_single(text: str) -> list[float]:
    """Embed a single text. Returns a 1D vector."""
    result = sarvam_embed([text])
    return result[0] if result else []


def _sarvam_embed_batch(texts: list[str]) -> list[list[float]]:
    """Call Sarvam AI embedding endpoint."""
    client = OpenAI(api_key=SARVAM_API_KEY, base_url=SARVAM_BASE_URL, timeout=30.0)
    response = client.embeddings.create(
        model="sarvam-embed",   # Sarvam's multilingual embedding model
        input=texts
    )
    return [d.embedding for d in response.data]


def _nvidia_multilingual_embed(texts: list[str]) -> list[list[float]]:
    """Call NVIDIA NIM with intfloat/multilingual-e5-large."""
    client = OpenAI(api_key=NVIDIA_API_KEY, base_url=NVIDIA_BASE_URL, timeout=60.0)
    # Process in batches of 32 (NVIDIA rate limit friendly)
    all_embeddings = []
    for i in range(0, len(texts), 32):
        batch = texts[i:i+32]
        response = client.embeddings.create(
            model="nvidia/nv-embedqa-e5-v5",
            input=batch,
            encoding_format="float",
            extra_body={"input_type": "passage", "truncate": "END"}
        )
        all_embeddings.extend([d.embedding for d in response.data])
    return all_embeddings


def _titan_embed_fallback(texts: list[str]) -> list[list[float]]:
    """Last resort: AWS Bedrock Titan (English only)."""
    import litellm
    all_embeddings = []
    for i in range(0, len(texts), 50):
        batch = texts[i:i+50]
        response = litellm.embedding(model="bedrock/amazon.titan-embed-text-v2:0", input=batch)
        all_embeddings.extend([d.embedding for d in response.data])
    return all_embeddings
