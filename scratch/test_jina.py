import os, requests
from dotenv import load_dotenv
load_dotenv()
headers = {'Authorization': f"Bearer {os.environ.get('JINA_API_KEY')}"}
payload = {
    'model': 'jina-reranker-v2-base-multilingual',
    'query': 'tell me everything about Customized Options',
    'documents': ['Customized Options HAS_VARIABLE custom_variable_classes']
}
res = requests.post('https://api.jina.ai/v1/rerank', headers=headers, json=payload)
print(res.json())
