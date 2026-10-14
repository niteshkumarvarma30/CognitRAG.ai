import os
import json
import time
from typing import List, Dict, Any
from Evaluation.schema import EvalExample
from Evaluation.run_pipeline import run_example

def collect(examples: List[EvalExample], api_base: str, out_path: str, delay_between_requests: float = 1.5) -> List[Dict[str, Any]]:
    """
    Runs a list of EvalExamples through CognitRAG and saves raw responses alongside gold examples.
    """
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    results = []
    
    print(f"[Collect] Processing {len(examples)} examples -> output: {out_path}")
    for idx, ex in enumerate(examples, 1):
        print(f"  [{idx}/{len(examples)}] Running '{ex.dataset_name}' ({ex.task_type}): {ex.example_id}")
        try:
            response = run_example(ex, api_base=api_base)
        except Exception as e:
            response = {"error": str(e)}
        
        results.append({
            "example_id": ex.example_id,
            "dataset_name": ex.dataset_name,
            "task_type": ex.task_type,
            "language_tag": ex.language_tag,
            "step_1_input": {
                "query": ex.input_query,
                "input_context": ex.input_context,
                "detected_language": response.get("language_detected") or response.get("detected_language", "en")
            },
            "step_2_retrieval": {
                "chunks_retrieved_count": len(response.get("citations", [])),
                "chunks": response.get("citations", []),
                "graph_context": response.get("graph_context", "")
            },
            "step_3_contradictions": response.get("contradictions", []),
            "step_4_generation": {
                "generated_answer": response.get("answer", ""),
                "citations": response.get("citations", []),
                "gold_answer": ex.gold_answer,
                "gold_label": ex.gold_label
            },
            "example": ex.model_dump(),
            "response": response
        })
        if delay_between_requests > 0:
            time.sleep(delay_between_requests)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"[Collect] Completed {len(results)} runs. Saved to {out_path}")
    return results
