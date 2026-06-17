import pandas as pd
import requests
import mlflow
import sys
import io
import os

# Import our custom judge
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from src.evaluation.sarvam_judge import grade_faithfulness, grade_relevance, grade_context_accuracy

# Fix Windows emoji encoding crash
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def main():
    print("Loading CSV dataset...")
    eval_df = pd.read_csv("langsmith_eval_dataset.csv").head(10)
    
    answers = []
    faithfulness_scores = []
    relevance_scores = []
    context_accuracy_scores = []
    
    for index, row in eval_df.iterrows():
        print(f"Testing Question {index + 1}/15: {row['question'][:50]}...")
        url = "http://localhost:8000/api/v1/chat"
        payload = {
            "tenant_id": row["tenant_id"],
            "message": row["question"]
        }
        
        try:
            response = requests.post(url, json=payload, timeout=60)
            if response.status_code == 200:
                data = response.json()
                answer = data.get("answer", "")
                context = data.get("context", "")
                
                print("  -> Success! Calling Sarvam Judge...")
                f_score = grade_faithfulness(row["question"], context, answer)
                r_score = grade_relevance(row["question"], answer)
                c_score = grade_context_accuracy(row["question"], row["expected_answer"], context)
                
                answers.append(answer)
                faithfulness_scores.append(f_score)
                relevance_scores.append(r_score)
                context_accuracy_scores.append(c_score)
                
                print(f"  -> Faith: {f_score} | Rel: {r_score} | CtxAcc: {c_score}")
            else:
                print(f"  -> API Error: {response.status_code}")
                answers.append(f"API Error: {response.status_code}")
                faithfulness_scores.append(0)
                relevance_scores.append(0)
                context_accuracy_scores.append(0)
        except Exception as e:
            print(f"  -> Failed: {str(e)}")
            answers.append(f"Failed: {str(e)}")
            faithfulness_scores.append(0)
            relevance_scores.append(0)
            context_accuracy_scores.append(0)
            
    # Add our manually computed answers and metrics back to the dataframe
    eval_df["answer"] = answers
    eval_df["faithfulness"] = faithfulness_scores
    eval_df["relevance"] = relevance_scores
    eval_df["context_accuracy"] = context_accuracy_scores
    
    # Calculate Averages
    avg_faith = sum(faithfulness_scores) / len(faithfulness_scores) if faithfulness_scores else 0
    avg_rel = sum(relevance_scores) / len(relevance_scores) if relevance_scores else 0
    avg_ctx = sum(context_accuracy_scores) / len(context_accuracy_scores) if context_accuracy_scores else 0
    
    print("Connecting to MLflow Tracking Server (localhost:5000)...")
    mlflow.set_tracking_uri("http://localhost:5000")
    mlflow.set_experiment("RAG-SaaS-Automated-Evaluation-V2")
    
    print("Starting MLflow evaluation run...")
    with mlflow.start_run() as run:
        # Removed mlflow.models.evaluate as it hangs for 15+ minutes in this environment
        # We only care about our 3 custom metrics anyway
        
        mlflow.log_metric("faithfulness/v1", avg_faith)
        mlflow.log_metric("relevance/v1", avg_rel)
        mlflow.log_metric("context_accuracy/v1", avg_ctx)
        
        print("\n--- Evaluation Metrics ---")
        print(f"faithfulness/v1: {avg_faith}")
        print(f"relevance/v1: {avg_rel}")
        print(f"context_accuracy/v1: {avg_ctx}")
            
    print("\nEvaluation complete! You can view the full dashboard and row-by-row results in the MLflow UI at http://localhost:5000")

if __name__ == "__main__":
    main()
