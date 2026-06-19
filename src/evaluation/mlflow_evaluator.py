import os
import instructor
import mlflow
import csv
import time
from openai import OpenAI
from pydantic import BaseModel, Field
from src.retrieval.graph import crag_app

# 1. Initialize our bulletproof Instructor Judge using Sarvam
judge_client = instructor.from_openai(OpenAI(
    api_key=os.environ.get("SARVAM_API_KEY", ""),
    base_url="https://api.sarvam.ai/v1"
))

class EvaluationScore(BaseModel):
    faithfulness_score: int = Field(ge=0, le=1)
    relevance_score: int = Field(ge=0, le=1)
    context_accuracy_score: int = Field(ge=0, le=1)

def evaluate_rag_response(question: str, retrieved_context: str, generated_answer: str) -> EvaluationScore:
    prompt = f"""
    [QUESTION]: {question}
    [CONTEXT]: {retrieved_context}
    [ANSWER]: {generated_answer}
    
    1. Faithfulness (0 or 1): Is the ANSWER completely supported by the CONTEXT without hallucinating?
    2. Relevance (0 or 1): Is the ANSWER highly relevant and directly answering the QUESTION?
    3. Context Accuracy (0 or 1): Does the CONTEXT accurately match the domain and intent of the QUESTION?
    """
    result = judge_client.chat.completions.create(
        model="sarvam-105b",
        response_model=EvaluationScore,
        messages=[
            {"role": "system", "content": "You are a strict grading judge."},
            {"role": "user", "content": prompt}
        ]
    )
    return result

# 2. Load the Test Suite from CSV
test_suite = []
with open("langsmith_eval_dataset.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        test_suite.append({
            "inputs": row["question"],
            "tenant_id": "f721d779-671a-5f4e-876c-97ad3d818b64"  # Force the correct tenant ID for the PostgreSQL manual
        })

# 3. Target the exact MLflow UI
mlflow.set_tracking_uri("sqlite:///mlflow.db")
mlflow.set_experiment("rag-saas-workflow-v2")

print("Starting Custom Bulletproof MLflow Evaluation...")
total_faithfulness = 0
total_relevance = 0
total_context_accuracy = 0

with mlflow.start_run(run_name="Llama-3-Custom-Metrics-Run"):
    for test in test_suite:
        # Run LangGraph Pipeline (This automatically logs traces to the UI!)
        final_state = crag_app.invoke({
            "tenant_id": test["tenant_id"],
            "question": test["inputs"],
            "generation": "",
            "documents": "",
            "route": ""
        })
        
        answer = final_state.get("generation", "")
        context = final_state.get("documents", "")
        
        # Grade using our Instructor Judge
        score = evaluate_rag_response(test["inputs"], context, answer)
        total_faithfulness += score.faithfulness_score
        total_relevance += score.relevance_score
        total_context_accuracy += score.context_accuracy_score

    # 4. Push the Final Grades directly into the MLflow UI 'Overview' Dashboard
    avg_faithfulness = total_faithfulness / len(test_suite)
    avg_relevance = total_relevance / len(test_suite)
    avg_context_accuracy = total_context_accuracy / len(test_suite)
    
    mlflow.log_metric("Faithfulness", avg_faithfulness)
    mlflow.log_metric("Relevance", avg_relevance)
    mlflow.log_metric("Context_Accuracy", avg_context_accuracy)

print("\n--- EVALUATION COMPLETE ---")
print("Check the 'Overview' tab of the new run to see your Metrics beautifully populated!")
