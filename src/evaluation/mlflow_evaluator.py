import os
import json
import re
import time
import mlflow
from dotenv import load_dotenv
from openai import OpenAI
import litellm
from src.retrieval.graph import crag_app

load_dotenv()

# 1. Initialize Clients
groq_client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY", ""),
    base_url="https://api.groq.com/openai/v1"
)
# We use nvidia_client for both models now, no secondary client needed.

# 2. Custom JSON Parser for Reasoning Models
def extract_scores(text: str):
    # Regex to extract JSON block if wrapped in markdown
    match = re.search(r'```(?:json)?\s*({.*?})\s*```', text, re.DOTALL)
    if match:
        json_str = match.group(1)
    else:
        # Fallback to finding the first { and last }
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1:
            json_str = text[start:end+1]
        else:
            json_str = "{}"
    try:
        data = json.loads(json_str)
        return {
            "faithfulness": int(data.get("faithfulness_score", 0)),
            "relevance": int(data.get("relevance_score", 0)),
            "context_accuracy": int(data.get("context_accuracy_score", 0))
        }
    except Exception as e:
        print(f"Failed to parse JSON: {e} | Raw Text: {text}")
        return {"faithfulness": 0, "relevance": 0, "context_accuracy": 0}

# 3. Grade Function

def grade_response(client, model: str, question: str, context: str, answer: str):
    prompt = f"""
    [QUESTION]: {question}
    [CONTEXT]: {context}
    [ANSWER]: {answer}
    
    You are a strict grading judge. Evaluate the RAG generated [ANSWER] based on the provided [CONTEXT] and [QUESTION].
    
    1. Faithfulness (0 or 1): Is the ANSWER completely supported by the CONTEXT without hallucinating?
    2. Relevance (0 or 1): Is the ANSWER highly relevant and directly answering the QUESTION?
    3. Context Accuracy (0 or 1): Does the CONTEXT accurately match the domain and intent of the QUESTION?
    
    You MUST output ONLY a valid JSON object in the exact following format. If you use a thinking process, ensure your final output is exactly this JSON block and nothing else:
    ```json
    {{
      "faithfulness_score": <0 or 1>,
      "relevance_score": <0 or 1>,
      "context_accuracy_score": <0 or 1>
    }}
    ```
    """
    max_retries = 3
    for attempt in range(max_retries):
        try:
            base_url_str = str(getattr(client, "base_url", ""))
            if "nvidia" in base_url_str:
                # Use NVIDIA API with requested model
                resp = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.1
                )
                text = resp.choices[0].message.content
            elif model.startswith("bedrock/"):
                import litellm
                result = litellm.completion(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.0
                )
                text = result.choices[0].message.content
            else:
                result = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.0,
                    response_format={"type": "json_object"}
                )
                text = result.choices[0].message.content
                
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                json_str = match.group(0)
            else:
                json_str = "{}"
                
            data = json.loads(json_str)
            return {
                "faithfulness": int(data.get("faithfulness_score", 0)),
                "relevance": int(data.get("relevance_score", 0)),
                "context_accuracy": int(data.get("context_accuracy_score", 0))
            }
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(10)
            else:
                print(f"Error calling judge: {e}")
                return {"faithfulness": 0, "relevance": 0, "context_accuracy": 0}


if __name__ == "__main__":
    # 4. Load Data
    test_suite = []
    try:
        with open("benchmark_30_questions.json", "r", encoding="utf-8") as f:
            questions = json.load(f)[:20]
            for q in questions:
                test_suite.append({
                    "inputs": q,
                    "tenant_id": "1de76f97-f700-5358-8769-e273c022fe84"
                })
    except Exception as e:
        print(f"Failed to load benchmark questions: {e}")
        exit(1)

    mlflow.set_tracking_uri("sqlite:///mlflow.db")
    mlflow.set_experiment("rag-saas-workflow-v2")

    nvidia_model = "bedrock/meta.llama3-70b-instruct-v1:0"
    nvidia_llama_model = "openai/gpt-oss-120b"

    print(f"Starting Dual-Model Evaluation on {len(test_suite)} Questions...")

    nvidia_scores = {"f": 0, "r": 0, "c": 0}
    nvidia_llama_scores = {"f": 0, "r": 0, "c": 0}

    with mlflow.start_run(run_name="Dual-Model-Evaluation-Run"):
        for idx, test in enumerate(test_suite, 1):
            print(f"\\nProcessing Question {idx}/{len(test_suite)}: {test['inputs']}")
            
            # 5. Generate RAG Answer
            final_state = crag_app.invoke({
                "tenant_id": test["tenant_id"],
                "question": test["inputs"],
                "generation": "",
                "documents": "",
                "route": ""
            })
            
            answer = final_state.get("generation", "")
            context = final_state.get("documents", "")
            print(f"RAG generated answer.")
            
            # 6. Grade with NVIDIA
            print(f"Grading with {nvidia_model}...")
            n_res = grade_response(groq_client, nvidia_model, test["inputs"], context, answer)
            nvidia_scores["f"] += n_res["faithfulness"]
            nvidia_scores["r"] += n_res["relevance"]
            nvidia_scores["c"] += n_res["context_accuracy"]
            print(f"  -> NVIDIA Scores: {n_res}")
            
            # 7. Grade with NVIDIA Llama 3
            print(f"Grading with {nvidia_llama_model}...")
            g_res = grade_response(groq_client, nvidia_llama_model, test["inputs"], context, answer)
            nvidia_llama_scores["f"] += g_res["faithfulness"]
            nvidia_llama_scores["r"] += g_res["relevance"]
            nvidia_llama_scores["c"] += g_res["context_accuracy"]
            print(f"  -> NVIDIA Llama Scores: {g_res}")
            time.sleep(5)

            
        # 8. Calculate Metrics
        n = len(test_suite)
        mlflow.log_metric("NVIDIA_Faithfulness", nvidia_scores["f"] / n)
        mlflow.log_metric("NVIDIA_Relevance", nvidia_scores["r"] / n)
        mlflow.log_metric("NVIDIA_Context_Accuracy", nvidia_scores["c"] / n)
        
        mlflow.log_metric("NVIDIA_Llama_Faithfulness", nvidia_llama_scores["f"] / n)
        mlflow.log_metric("NVIDIA_Llama_Relevance", nvidia_llama_scores["r"] / n)
        mlflow.log_metric("NVIDIA_Llama_Context_Accuracy", nvidia_llama_scores["c"] / n)
        
    print("\\n--- EVALUATION COMPLETE ---")
    print("NVIDIA Averages:")
    print(f"  Faithfulness: {nvidia_scores['f']/n:.2f} | Relevance: {nvidia_scores['r']/n:.2f} | Context: {nvidia_scores['c']/n:.2f}")
    print("NVIDIA Llama Averages:")
    print(f"  Faithfulness: {nvidia_llama_scores['f']/n:.2f} | Relevance: {nvidia_llama_scores['r']/n:.2f} | Context: {nvidia_llama_scores['c']/n:.2f}")
