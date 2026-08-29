import requests

url = "http://localhost:8000/api/v1/ingest"
file_path = r"c:\AI\Projects\RAG SaaS\Microsoft_10K_Full.txt"
tenant_id = "user_3FGB3zjJhpqdecshUi0ZFu1DUp1"

with open(file_path, "rb") as f:
    files = {"file": ("Microsoft_10K_Full.txt", f, "text/plain")}
    data = {"tenant_id": tenant_id}
    print(f"Uploading {file_path} to {url}...")
    try:
        response = requests.post(url, files=files, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Failed to connect to API: {e}")
