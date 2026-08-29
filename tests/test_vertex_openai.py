import os
from openai import OpenAI
from google.oauth2 import service_account
import google.auth.transport.requests

key_path = r"c:\AI\Projects\RAG SaaS\neon-rampart-475915-m4-7361322a43ed.json"
credentials = service_account.Credentials.from_service_account_file(
    key_path, scopes=['https://www.googleapis.com/auth/cloud-platform']
)
request = google.auth.transport.requests.Request()
credentials.refresh(request)

client = OpenAI(
    api_key=credentials.token,
    base_url="https://us-central1-aiplatform.googleapis.com/v1beta1/projects/neon-rampart-475915-m4/locations/us-central1/endpoints/openapi"
)

try:
    response = client.chat.completions.create(
        model="google/gemini-2.5-flash",
        messages=[{"role": "user", "content": "Reply with OK"}]
    )
    print("Success:", response.choices[0].message.content)
except Exception as e:
    print("Error:", e)
