import os
import json
import glob

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    traces_dir = os.path.join(root_dir, "enterprise_audit_package", "stage_traces", "traces_json")
    out_dir = os.path.join(root_dir, "enterprise_audit_package", "ragas_and_deepeval", "datasets")
    os.makedirs(out_dir, exist_ok=True)

    trace_files = glob.glob(os.path.join(traces_dir, "*.json"))
    print(f"Found {len(trace_files)} trace JSON files.")

    eval_items = []
    for tf in trace_files:
        with open(tf, "r", encoding="utf-8") as f:
            data = json.load(f)

        qid = data.get("query_id")
        query = data.get("query")
        gt = data.get("ground_truth", "")
        source_type = data.get("source_type", "")

        stages = data.get("stages", {})
        gen_stage = stages.get("stage_7_generation", {})
        answer = gen_stage.get("generated_answer", "")

        # Extract retrieved context snippets
        fusion_stage = stages.get("stage_4_hybrid_fusion", {})
        fused = fusion_stage.get("fused_candidates", [])
        contexts = [c.get("snippet", "") for c in fused if c.get("snippet")]
        if not contexts:
            # Check dense stage
            dense = stages.get("stage_2_dense_vector", {}).get("top_5_results", [])
            contexts = [c.get("content_snippet", "") for c in dense if c.get("content_snippet")]

        if not contexts:
            contexts = ["No context retrieved."]

        eval_items.append({
            "id": qid,
            "user_input": query,
            "response": answer,
            "retrieved_contexts": contexts,
            "reference": gt,
            "source_type": source_type
        })

    eval_items.sort(key=lambda x: x["id"])
    out_path = os.path.join(out_dir, "eval_dataset_50.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(eval_items, f, indent=2)

    print(f"Saved {len(eval_items)} evaluation test cases to {out_path}")

if __name__ == "__main__":
    main()
