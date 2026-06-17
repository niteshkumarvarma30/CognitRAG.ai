import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(
    api_key=os.environ.get("GITHUB_TOKEN"), 
    base_url="https://models.inference.ai.azure.com"
)
prompt = """Context:
Customized options in PostgreSQL allow for the integration of additional functionalities through add-on modules. These options enable the configuration of features not normally known to PostgreSQL, enhancing its flexibility.

---

Customized Options HAS_VARIABLE custom_variable_classes"""

res = client.chat.completions.create(
    model="gpt-4o-mini", 
    messages=[
        {"role": "system", "content": "You are an expert SaaS support assistant. Answer the user's question using the provided Context."}, 
        {"role": "user", "content": f"{prompt}\n\nQuestion: tell me everything about Customized Options"}
    ]
)
print(res.choices[0].message.content)
