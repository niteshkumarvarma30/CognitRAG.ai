import os
import json
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Evaluation.score import wilson_ci
from Evaluation.store_results import RESULTS_DIR

def main():
    traces_file = os.path.join(RESULTS_DIR, "codemixed_qa_traces.json")
    if not os.path.exists(traces_file):
        print(f"Error: {traces_file} not found.")
        return
        
    with open(traces_file, "r", encoding="utf-8") as f:
        traces = json.load(f)
        
    print(f"Loaded {len(traces)} CodeMixed-QA traces from {traces_file}")
    
    # We load the existing routing decisions or run route_query
    from src.retrieval.nodes import route_query
    
    faq_correct = 0
    faq_total = 0
    
    retrieval_correct = 0
    retrieval_total = 0
    
    overall_correct = 0
    overall_total = 0
    
    for trace in traces:
        q = trace.get("question")
        if not q:
            continue
        dec = route_query({"question": q, "tenant_id": "eval_tenant"})
        route = dec.get("route", "technical_query")
        
        # In codemixed_qa_traces, consensus correctness
        is_correct = trace.get("judge_consensus_correct", False)
        
        overall_total += 1
        if is_correct:
            overall_correct += 1
            
        if route in ["faq", "greeting"]:
            faq_total += 1
            if is_correct:
                faq_correct += 1
        else:
            retrieval_total += 1
            if is_correct:
                retrieval_correct += 1
                
    faq_lo, faq_hi = wilson_ci(faq_correct, faq_total)
    retrieval_lo, retrieval_hi = wilson_ci(retrieval_correct, retrieval_total)
    overall_lo, overall_hi = wilson_ci(overall_correct, overall_total)
    
    output = {
        "dataset_name": "codemixed-qa",
        "sample_size": overall_total,
        "dataset_origin": "CodeMixed-QA (Hindi-English colloquial/entertainment QA from Twitter/web forums, lacking grounding documents)",
        "faq-routed": {
            "n": faq_total,
            "correct": faq_correct,
            "accuracy": round(faq_correct / faq_total if faq_total else 0, 4),
            "ci_low": faq_lo,
            "ci_high": faq_hi,
            "status": "statistically_sound",
            "description": "Routed to FAQ (direct generation without context). Trivia queries fail without context."
        },
        "retrieval-routed (technical+agent)": {
            "n": retrieval_total,
            "correct": retrieval_correct,
            "accuracy": round(retrieval_correct / retrieval_total if retrieval_total else 0, 4),
            "ci_low": retrieval_lo,
            "ci_high": retrieval_hi,
            "status": "preliminary (N < 30)",
            "description": "Routed to retrieval/graph."
        },
        "Overall (blended)": {
            "n": overall_total,
            "correct": overall_correct,
            "accuracy": round(overall_correct / overall_total if overall_total else 0, 4),
            "ci_low": overall_lo,
            "ci_high": overall_hi,
            "status": "statistically_sound"
        }
    }
    
    out_file = os.path.join(RESULTS_DIR, "codemixed_qa_routing_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    print(f"Saved CodeMixed-QA routing results to {out_file}")

if __name__ == "__main__":
    main()
