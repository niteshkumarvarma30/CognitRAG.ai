import os
import instructor
import mlflow
from openai import OpenAI
from pydantic import BaseModel, Field
from src.retrieval.graph import crag_app

# 1. Initialize our bulletproof Instructor Judge using Sarvam
judge_client = instructor.from_openai(OpenAI(
    api_key=os.environ.get("SARVAM_API_KEY", ""),
    base_url="https://api.sarvam.ai/v1"
))

class EvaluationScore(BaseModel):
    context_precision_score: int = Field(ge=0, le=1)
    faithfulness_score: int = Field(ge=0, le=1)

def evaluate_rag_response(question: str, retrieved_context: str, generated_answer: str) -> EvaluationScore:
    prompt = f"""
    [QUESTION]: {question}
    [CONTEXT]: {retrieved_context}
    [ANSWER]: {generated_answer}
    
    1. Context Precision (0 or 1): Does the CONTEXT contain enough info to answer the QUESTION?
    2. Faithfulness (0 or 1): Is the ANSWER completely supported by the CONTEXT without hallucinating?
    """
    return judge_client.chat.completions.create(
        model="sarvam-105b",
        response_model=EvaluationScore,
        messages=[
            {"role": "system", "content": "You are a strict grading judge."},
            {"role": "user", "content": prompt}
        ]
    )

# 2. Define the Test Suite
test_suite = [
    {"inputs": "Tell me about Developer Options, specifically debug_assertions.", "tenant_id": "619f50ab-df74-4057-9305-05a70fdc2474"},
    {"inputs": "What happens if wal_consistency_checking is enabled?", "tenant_id": "619f50ab-df74-4057-9305-05a70fdc2474"},
    {"inputs": "What is the CPU stepping and microcode version for the Intel Celeron 7305 processor?", "tenant_id": "3780bb27-250a-4a2c-be4b-9252b8e8ce9a"},
    {"inputs": "What is the maximum instance storage and network bandwidth for the im4gn.4xlarge EC2 instance?", "tenant_id": "a7f179d0-83b7-4960-843f-3cac536797f3"}
]

# 3. Target the exact MLflow UI
mlflow.set_tracking_uri("sqlite:///mlflow.db")
mlflow.set_experiment("rag-saas-workflow")

print("Starting Custom Bulletproof MLflow Evaluation...")
total_precision = 0
total_faithfulness = 0

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
        total_precision += score.context_precision_score
        total_faithfulness += score.faithfulness_score

    # 4. Push the Final Grades directly into the MLflow UI 'Overview' Dashboard
    avg_precision = total_precision / len(test_suite)
    avg_faithfulness = total_faithfulness / len(test_suite)
    
    mlflow.log_metric("Context_Precision_Accuracy", avg_precision)
    mlflow.log_metric("Answer_Faithfulness_Accuracy", avg_faithfulness)

print("\n--- EVALUATION COMPLETE ---")
print("Check the 'Overview' tab of the new run to see your Metrics beautifully populated!")
