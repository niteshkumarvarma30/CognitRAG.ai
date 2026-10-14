import sys; sys.stdout.reconfigure(encoding='utf-8')
import os, requests
from dotenv import load_dotenv; load_dotenv()
key = os.environ.get('SARVAM_API_KEY', '').strip().strip("'")

base = "https://api.sarvam.ai"

# Probe all possible embedding-related endpoints
endpoints_to_probe = [
    ("GET", "/v1/models"),
    ("POST", "/v1/embeddings"),
    ("POST", "/v2/embeddings"),
    ("POST", "/embeddings"),
    ("POST", "/v1/embed"),
    ("POST", "/text/embeddings"),
]
sample_payload = {"input": ["Bhai yaar kya chal raha hai"], "model": "sarvam-embed"}

for method, path in endpoints_to_probe:
    url = base + path
    try:
        if method == "GET":
            r = requests.get(url, headers={'Authorization': f'Bearer {key}', 'api-subscription-key': key}, timeout=8)
        else:
            r = requests.post(url,
                headers={'Authorization': f'Bearer {key}', 'api-subscription-key': key, 'Content-Type': 'application/json'},
                json=sample_payload, timeout=8)
        print(f"{method} {path}: {r.status_code} | {r.text[:100]}")
    except Exception as e:
        print(f"{method} {path}: ERROR {str(e)[:60]}")

# Also test the sarvam-105b chat model
print("\n--- Testing sarvam-105b chat ---")
resp = requests.post(f"{base}/v1/chat/completions",
    headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'},
    json={'model': 'sarvam-105b', 'messages': [{'role': 'user', 'content': 'Say SUPPORTED in one word'}], 'max_tokens': 5},
    timeout=20)
print(f"Chat status: {resp.status_code}")
if resp.status_code == 200:
    print("Response:", resp.json()['choices'][0]['message']['content'])
else:
    print(resp.text[:200])
