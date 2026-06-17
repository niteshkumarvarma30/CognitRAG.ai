import os
import requests
from dotenv import load_dotenv
from langsmith import evaluate, Client
from langchain_openai import ChatOpenAI

# Load environment variables from .env
load_dotenv()

# Ensure keys are present
if not os.getenv("LANGCHAIN_API_KEY"):
    print("Error: LANGCHAIN_API_KEY not found in .env")
    exit(1)
if not os.getenv("SARVAM_API_KEY"):
    print("Error: SARVAM_API_KEY not found in .env")
    exit(1)

# Initialize LangSmith client
client = Client()

# The name of the dataset you created in LangSmith UI
# UPDATE THIS if you named it differently!
# Change this if your dataset is named something else in the LangSmith UI!
DATASET_NAME = "RAG SaaS"

def target_api(inputs: dict) -> dict:
    """
    This function takes the inputs from the LangSmith dataset row,
    sends them to your local FastAPI server, and returns the generated output.
    """
    url = "http://localhost:8000/api/v1/chat"
    payload = {
        "tenant_id": inputs["tenant_id"],
        "message": inputs["question"]
    }
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        if response.status_code == 200:
            return {"answer": response.json()["answer"]}
        else:
            return {"answer": f"API Error: {response.status_code} - {response.text}"}
    except Exception as e:
        return {"answer": f"Request Failed: {str(e)}"}

def qa_evaluator(run, example):
    import os
    import json
    
    question = example.inputs["question"]
    expected = example.outputs.get("expected_answer", "")
    actual = run.outputs.get("answer", "")
    
    prompt = f"Question: {question}\nExpected Answer: {expected}\nActual Answer: {actual}\n\nIs the actual answer factually equivalent to the expected answer? Reply with exactly YES or NO."
    
    url = "https://api.sarvam.ai/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "api-subscription-key": os.getenv("SARVAM_API_KEY")
    }
    data = {
        "model": "sarvam-1",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            result = response.json()["choices"][0]["message"]["content"].strip().upper()
            return {"key": "correctness", "score": 1 if result.startswith("YES") else 0}
        else:
            return {"key": "correctness", "score": 0}
    except:
        return {"key": "correctness", "score": 0}

def main():
    print(f"Starting evaluation against dataset: {DATASET_NAME}")
    print("Ensure your FastAPI server is running on localhost:8000...")

    # Run the evaluation
    experiment_results = evaluate(
        target_api,
        data=DATASET_NAME,
        evaluators=[qa_evaluator],
        experiment_prefix="RAG-Pipeline-V1",
        description="Testing Phase 7 Semantic Chunking and Parent-Document Retrieval"
    )
    
    print("\nEvaluation Complete! View the results in the LangSmith UI.")

if __name__ == "__main__":
    main()
