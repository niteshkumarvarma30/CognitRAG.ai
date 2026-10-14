"""
Sarvam AI Client
Specialized for Indian Language & Hinglish Processing
Capabilities:
- Translation & Code-Switching Normalization (mayura:v1)
- Speech-to-Text / Audio Ingestion (saaras:v2 / speech-to-text-translate)
"""

import os
import requests
from typing import Optional, Dict, Any

class SarvamClient:
    def __init__(self):
        self.api_key = os.environ.get("SARVAM_API_KEY", "")
        self.base_url = "https://api.sarvam.ai"

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    def _headers(self) -> Dict[str, str]:
        return {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json"
        }

    def translate(
        self,
        text: str,
        source_lang: str = "hi-IN",
        target_lang: str = "en-IN",
        mode: str = "formal"
    ) -> str:
        """
        Translates Hindi / Hinglish text into canonical English using Sarvam mayura:v1.
        """
        if not self.is_available() or not text.strip():
            return text

        url = f"{self.base_url}/translate"
        payload = {
            "input": text,
            "source_language_code": source_lang,
            "target_language_code": target_lang,
            "mode": mode,
            "model": "mayura:v1"
        }

        try:
            res = requests.post(url, json=payload, headers=self._headers(), timeout=15)
            if res.status_code == 200:
                data = res.json()
                return data.get("translated_text", text)
            return text
        except Exception as e:
            print(f"[Sarvam Translate] Warning: {e}. Falling back to original text.")
            return text

    def transcribe_audio(self, audio_bytes: bytes, target_language_code: str = "en-IN") -> str:
        """
        Transcribes speech in Indian languages/Hinglish to English text using Sarvam speech-to-text.
        """
        if not self.is_available():
            raise RuntimeError("SARVAM_API_KEY is not configured.")

        url = f"{self.base_url}/speech-to-text-translate"
        headers = {"api-subscription-key": self.api_key}
        files = {
            "file": ("audio.wav", audio_bytes, "audio/wav")
        }
        data = {
            "target_language_code": target_language_code
        }

        res = requests.post(url, headers=headers, files=files, data=data, timeout=30)
        if res.status_code != 200:
            raise RuntimeError(f"Sarvam audio transcription failed ({res.status_code}): {res.text}")

        res_json = res.json()
        return res_json.get("transcript", "")

sarvam_client = SarvamClient()
