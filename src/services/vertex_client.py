"""
Google Cloud Vertex AI Client
Subsidized by Google for Startups $2,000 Credit
Project: neon-rampart-475915-m4
Location: us-central1
Models:
- Generation / Graph Extraction: gemini-2.5-flash
- Vector Embeddings: text-embedding-004 (768 dimensions)
"""

import os
import json
import time
import requests
from typing import List, Dict, Any, Optional
from google.oauth2 import service_account
from google.auth.transport.requests import Request

class VertexAIClient:
    def __init__(self):
        self.project_id = os.environ.get("GCP_PROJECT_ID", "neon-rampart-475915-m4")
        self.location = os.environ.get("GCP_LOCATION", "us-central1")
        self.model_name = os.environ.get("VERTEX_MODEL", "gemini-2.5-flash")
        self.embedding_model_name = os.environ.get("VERTEX_EMBEDDING_MODEL", "text-embedding-004")
        
        # Credentials from config or Cloud Run environment
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "config/neon-rampart-475915-m4-7361322a43ed.json")
        if not os.path.isabs(cred_path):
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
            cred_path = os.path.join(base_dir, cred_path)
            
        import google.auth
        if os.path.exists(cred_path):
            self.credentials = service_account.Credentials.from_service_account_file(
                cred_path,
                scopes=["https://www.googleapis.com/auth/cloud-platform"]
            )
        else:
            self.credentials, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
        self._token = None
        self._token_expiry = 0

    def _get_token(self) -> str:
        """Refreshes and caches OAuth2 token for Vertex AI REST endpoints."""
        now = time.time()
        if not self._token or now >= self._token_expiry - 60:
            self.credentials.refresh(Request())
            self._token = self.credentials.token
            self._token_expiry = now + 3500
        return self._token

    def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        json_schema: Optional[Dict[str, Any]] = None,
        temperature: float = 0.2,
        max_output_tokens: int = 2048
    ) -> str:
        """
        Invokes gemini-2.5-flash on Vertex AI with high throughput and up to 1M token context.
        """
        token = self._get_token()
        url = (
            f"https://{self.location}-aiplatform.googleapis.com/v1/"
            f"projects/{self.project_id}/locations/{self.location}/"
            f"publishers/google/models/{self.model_name}:generateContent"
        )
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        payload: Dict[str, Any] = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_output_tokens
            }
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        if json_schema:
            payload["generationConfig"]["responseMimeType"] = "application/json"
            payload["generationConfig"]["responseSchema"] = json_schema

        response = requests.post(url, json=payload, headers=headers, timeout=60)
        if response.status_code != 200:
            raise RuntimeError(f"Vertex AI generate failed ({response.status_code}): {response.text}")

        res_json = response.json()
        try:
            return res_json["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as err:
            raise RuntimeError(f"Malformed Vertex AI response: {res_json}") from err

    def generate_structured(
        self,
        prompt: str,
        response_model: Any,
        system_instruction: Optional[str] = None,
        temperature: float = 0.0
    ) -> Any:
        """
        Generates structured JSON conforming to a Pydantic model using gemini-2.5-flash.
        """
        import re
        schema_dict = None
        if hasattr(response_model, "model_json_schema"):
            schema_dict = response_model.model_json_schema()
        elif hasattr(response_model, "schema"):
            schema_dict = response_model.schema()

        augmented_sys = (system_instruction or "") + "\nRespond with valid JSON only. Do not include markdown code block ticks (```) or commentary."
        if schema_dict:
            augmented_sys += f"\nRequired JSON Schema:\n{json.dumps(schema_dict)}"

        raw_text = self.generate(
            prompt=prompt,
            system_instruction=augmented_sys,
            temperature=temperature
        )
        clean_text = raw_text.strip()
        if clean_text.startswith("```"):
            clean_text = re.sub(r"^```(?:json)?\s*", "", clean_text)
            clean_text = re.sub(r"\s*```$", "", clean_text).strip()

        try:
            if hasattr(response_model, "model_validate_json"):
                return response_model.model_validate_json(clean_text)
            elif hasattr(response_model, "parse_raw"):
                return response_model.parse_raw(clean_text)
            else:
                return json.loads(clean_text)
        except Exception:
            match = re.search(r"\{.*\}", clean_text, re.DOTALL)
            if match:
                if hasattr(response_model, "model_validate_json"):
                    return response_model.model_validate_json(match.group(0))
                elif hasattr(response_model, "parse_raw"):
                    return response_model.parse_raw(match.group(0))
                else:
                    return json.loads(match.group(0))
            raise

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates 768-dimensional dense vectors using text-embedding-004 on Vertex AI.
        Supports batch processing for high ingestion throughput.
        """
        if not texts:
            return []

        token = self._get_token()
        url = (
            f"https://{self.location}-aiplatform.googleapis.com/v1/"
            f"projects/{self.project_id}/locations/{self.location}/"
            f"publishers/google/models/{self.embedding_model_name}:predict"
        )
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        results: List[List[float]] = []
        batch_size = 50

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            instances = [{"content": t} for t in batch]
            payload = {"instances": instances}

            response = requests.post(url, json=payload, headers=headers, timeout=60)
            if response.status_code != 200:
                raise RuntimeError(f"Vertex AI embedding failed ({response.status_code}): {response.text}")

            res_json = response.json()
            predictions = res_json.get("predictions", [])
            for pred in predictions:
                results.append(pred["embeddings"]["values"])

        return results

    def get_embedding(self, text: str) -> List[float]:
        """Convenience method for a single text string."""
        res = self.get_embeddings([text])
        return res[0] if res else []

vertex_client = VertexAIClient()
