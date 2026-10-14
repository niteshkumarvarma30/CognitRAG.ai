import os
import json
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Evaluation.score import wilson_ci
from Evaluation.store_results import RESULTS_DIR

def main():
    hgqa_traces_file = os.path.join(
        os.path.dirname(__file__), 
        "v4_gluecos_comi_revalidation", 
        "traces", 
        "hgqa_v1_traces_with_routes.json"
    )
    
    if not os.path.exists(hgqa_traces_file):
        print(f"Error: {hgqa_traces_file} not found.")
        return
        
    with open(hgqa_traces_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        traces = data.get("traces", [])
        
    print(f"Loaded {len(traces)} true HGQA traces from {hgqa_traces_file}")
    assert len(traces) == 60, f"Expected 60 traces for HGQA, found {len(traces)}"
    
    faq_correct = 0
    faq_total = 0
    
    tech_correct = 0
    tech_total = 0
    
    agent_correct = 0
    agent_total = 0
    
    retrieval_correct = 0
    retrieval_total = 0
    
    overall_correct = 0
    overall_total = 0
    
    for trace in traces:
        route = trace.get("route", "technical_query")
        is_supported = trace.get("is_supported", False)
        
        overall_total += 1
        if is_supported:
            overall_correct += 1
            
        if route == "faq" or route == "greeting":
            faq_total += 1
            if is_supported:
                faq_correct += 1
        elif route == "technical_query":
            tech_total += 1
            retrieval_total += 1
            if is_supported:
                tech_correct += 1
                retrieval_correct += 1
        elif route == "agent_query":
            agent_total += 1
            retrieval_total += 1
            if is_supported:
                agent_correct += 1
                retrieval_correct += 1
        else:
            retrieval_total += 1
            if is_supported:
                retrieval_correct += 1
                
    faq_lo, faq_hi = wilson_ci(faq_correct, faq_total)
    tech_lo, tech_hi = wilson_ci(tech_correct, tech_total)
    agent_lo, agent_hi = wilson_ci(agent_correct, agent_total)
    retrieval_lo, retrieval_hi = wilson_ci(retrieval_correct, retrieval_total)
    overall_lo, overall_hi = wilson_ci(overall_correct, overall_total)
    
    output = {
        "dataset_name": "hgqa-v1",
        "sample_size": 60,
        "dataset_origin": "SQuAD v2 validation split, answerable questions only, stratified across 35 article topics with seeded conversational Hinglish prefixes.",
        "faq-routed": {
            "n": faq_total,
            "correct": faq_correct,
            "accuracy": round(faq_correct / faq_total if faq_total else 0, 4),
            "ci_low": faq_lo,
            "ci_high": faq_hi,
            "status": "statistically_sound" if faq_total >= 30 else "preliminary",
            "description": "Direct generation, no retrieval. Measures general Hinglish comprehension & LLM parametric answering."
        },
        "technical_query": {
            "n": tech_total,
            "correct": tech_correct,
            "accuracy": round(tech_correct / tech_total if tech_total else 0, 4),
            "ci_low": tech_lo,
            "ci_high": tech_hi,
            "status": "preliminary (N < 30)"
        },
        "agent_query": {
            "n": agent_total,
            "correct": agent_correct,
            "accuracy": round(agent_correct / agent_total if agent_total else 0, 4),
            "ci_low": agent_lo,
            "ci_high": agent_hi,
            "status": "preliminary (N < 30)"
        },
        "retrieval-routed (technical+agent)": {
            "n": retrieval_total,
            "correct": retrieval_correct,
            "accuracy": round(retrieval_correct / retrieval_total if retrieval_total else 0, 4),
            "ci_low": retrieval_lo,
            "ci_high": retrieval_hi,
            "status": "preliminary (N < 30)",
            "description": "True product claim: Citation-grounded hybrid retrieval & graph traversal."
        },
        "Overall (blended)": {
            "n": overall_total,
            "correct": overall_correct,
            "accuracy": round(overall_correct / overall_total if overall_total else 0, 4),
            "ci_low": overall_lo,
            "ci_high": overall_hi,
            "status": "statistically_sound",
            "description": "Blends direct FAQ generation with grounded retrieval. Reference only."
        }
    }
    
    print("\n" + "=" * 70)
    print("TRUE HGQA v1 ROUTING RE-SLICE (N=60)")
    print("=" * 70)
    for k in ["faq-routed", "technical_query", "agent_query", "retrieval-routed (technical+agent)", "Overall (blended)"]:
        v = output[k]
        print(f"\n[{k}]")
        if "description" in v:
            print(f"  Description: {v['description']}")
        print(f"  Sample Size (N): {v['n']}")
        print(f"  Correct: {v['correct']}")
        print(f"  Accuracy: {v['accuracy']*100:.2f}%")
        print(f"  Wilson 95% CI: [{v['ci_low']*100:.1f}% - {v['ci_high']*100:.1f}%]")
        print(f"  Status: {v['status']}")
        
    out_file = os.path.join(RESULTS_DIR, "hgqa_v1_recut_routing_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    print(f"\nSaved true HGQA v1 results to {out_file}")

if __name__ == "__main__":
    main()
