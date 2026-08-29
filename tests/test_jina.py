import urllib.request, json, os

env_path = '.env'
jina_key = None
with open(env_path) as f:
    for line in f:
        if line.startswith('JINA_API_KEY='):
            jina_key = line.split('=')[1].strip().strip('\'\"')
            break

req = urllib.request.Request('https://api.jina.ai/v1/rerank',
    data=json.dumps({'model': 'jina-reranker-v2-base-multilingual', 'query': 'What is revenue?', 'documents': ['Revenue is 100']}).encode(),
    headers={'Authorization': f'Bearer {jina_key}', 'Content-Type': 'application/json'},
    method='POST')
try:
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
        print(json.dumps(data, indent=2))
except Exception as e:
    print(e.read().decode() if hasattr(e, 'read') else str(e))
