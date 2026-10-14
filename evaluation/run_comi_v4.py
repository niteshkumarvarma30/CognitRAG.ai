import os
import sys
import json
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Evaluation.v4_gluecos_comi_revalidation.loaders.comi_lingua_loader import load_comi_out_of_sample
from Evaluation.collect_runs import collect
from Evaluation.score import score_dataset
from Evaluation.store_results import RESULTS_DIR

def main():
    print("=" * 80)
    print("RUNNING FRESH OUT-OF-SAMPLE COMI-LINGUA TEST (v4 loader with K-value override)")
    print("=" * 80)
    
    # Load 40 per label (or whatever is available)
    raw_examples = load_comi_out_of_sample(n_per_label=40, seed=99)
    
    # Convert to EvalExample objects expected by collect()
    from Evaluation.schema import EvalExample
    examples = []
    for row in raw_examples:
        examples.append(EvalExample(
            example_id=row["example_id"],
            dataset_name="comi-lingua-v4",
            task_type="language_id",
            input_query=row["text"],
            gold_label=row["gold_label"],
            language_tag=row["gold_label"],
            metadata={"source": "comi_out_of_sample_v4"}
        ))
        
    out_file = os.path.join(RESULTS_DIR, "runs_comi-lingua-v4.json")
    print(f"Executing pipeline on {len(examples)} examples...")
    collect(examples, api_base="http://localhost:8000", out_path=out_file)
    
    print("\nScoring results...")
    with open(out_file, "r", encoding="utf-8") as f:
        results = json.load(f)
        
    scores = score_dataset(results, category_field="task_type")
    
    print("\n" + "=" * 60)
    print("COMI-LINGUA OUT-OF-SAMPLE RESULTS (K=2)")
    print("=" * 60)
    print("LIMITATION: English dataset exhaustion flagged. Because Devanagari is excluded, and many samples contain Hindi, finding pure English Romanized samples is limited.\n")
    for cat, metric in scores.items():
        print(f"[{cat.upper()}]")
        print(f"  Sample Size (N): {metric['n']}")
        print(f"  Accuracy: {metric['score_percent']}%")
        print(f"  Wilson 95% CI: {metric['ci_range_percent']}")
        
if __name__ == "__main__":
    main()
