import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.retrieval.nodes import route_query
from Evaluation.store_results import RESULTS_DIR

def main():
    ground_truth_file = os.path.join(RESULTS_DIR, "router_ground_truth.json")
    if not os.path.exists(ground_truth_file):
        print("Run build_router_ground_truth.py first.")
        return
        
    with open(ground_truth_file, "r", encoding="utf-8") as f:
        examples = json.load(f)
        
    correct = 0
    total = len(examples)
    
    print(f"Evaluating {total} router examples...")
    
    for ex in examples:
        query = ex["query"]
        gold_route = ex["gold_route"]
        
        route_decision = route_query({"question": query, "tenant_id": "eval_tenant"})
        # In current logic, if it's not a known route, it defaults to technical_query, but route_decision.get("route") should return what we want.
        pred_route = route_decision.get("route")
        
        # We consider 'greeting' equivalent to 'faq' for evaluation purposes if gold is faq
        if pred_route == "greeting" and gold_route == "faq":
            pred_route = "faq"
            
        if pred_route == gold_route:
            correct += 1
        else:
            print(f"[MISMATCH] Q: {query} | Gold: {gold_route} | Pred: {pred_route}")
            
    accuracy = correct / total
    print("\n" + "=" * 60)
    print("ROUTER CALIBRATION RESULTS")
    print("=" * 60)
    print(f"  Total Evaluated: {total}")
    print(f"  Correct: {correct}")
    print(f"  Accuracy: {accuracy * 100:.2f}%")
    print("=" * 60)

if __name__ == "__main__":
    main()
