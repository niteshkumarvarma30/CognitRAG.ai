"""
CognitRAG.ai — Master Evaluation Suite CLI
==========================================
Executes golden-dataset benchmarking sequentially:
1. Judge Calibration (Ensemble dual-judge on human-labeled gold sets)
2. Dataset Acquisition & Pipeline Runs (RAGTruth, EntRAG, ALCE, COMI-LINGUA, CodeMixed-QA, HiFACTMix)
3. Wilson Confidence Interval Scoring
4. Storage & Human Audit Reporting
"""
import os
import sys
import argparse
from datetime import datetime

# Reconfigure stdout for utf-8 on Windows
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Evaluation.loaders import (
    load_ragtruth,
    load_ragtruth_balanced,
    load_entrag,
    load_alce,
    load_comi_lingua,
    load_codemixed_qa,
    load_hifactmix
)
from Evaluation.collect_runs import collect
from Evaluation.judge import calibrate
from Evaluation.score import score_dataset
from Evaluation.store_results import store_local, store_supabase, RESULTS_DIR


def step_calibrate(sample_limit: int = 24):
    print("=" * 80)
    print("STEP 1: DUAL-JUDGE ENSEMBLE CALIBRATION (Stratified Label-Balanced RAGTruth Gold)")
    print("=" * 80)
    # Balanced sampling: at least 10-12 per label class (SUPPORTED & UNSUPPORTED)
    n_per = max(5, sample_limit // 2)
    gold_examples = load_ragtruth_balanced(n_per_label=n_per)

    calib_results = calibrate(
        golden_examples=gold_examples,
        judge_model_a=os.environ.get("JUDGE_MODEL_A", "openai/gpt-oss-120b"),
        judge_model_b=os.environ.get("JUDGE_MODEL_B", "qwen/qwen3.8-27b")
    )
    store_local(calib_results, filename="calibration_metrics.json")
    return calib_results


def step_run_datasets(dataset_name: str = "all", limit: int = 50, api_base: str = "http://localhost:8000"):
    print("=" * 80)
    print(f"STEP 2: PIPELINE EXECUTION & BATCH COLLECTION (Target: {dataset_name})")
    print("=" * 80)

    dataset_map = {
        "ragtruth": load_ragtruth,
        "entrag": load_entrag,
        "comi-lingua": load_comi_lingua,
        "codemixed-qa": load_codemixed_qa,
        "hifactmix": load_hifactmix
    }

    targets = list(dataset_map.keys()) if dataset_name == "all" else [dataset_name]
    collected_files = {}

    for d_name in targets:
        loader_fn = dataset_map.get(d_name)
        if not loader_fn:
            print(f"[Run] Unknown dataset: {d_name}")
            continue
        
        print(f"\n--- Loading Dataset: {d_name.upper()} (limit: {limit}) ---")
        examples = loader_fn(limit=limit)
        out_file = os.path.join(RESULTS_DIR, f"runs_{d_name}.json")
        collect(examples, api_base=api_base, out_path=out_file)
        collected_files[d_name] = out_file

    return collected_files


def step_score_and_report():
    print("=" * 80)
    print("STEP 3: WILSON SCORE 95% CONFIDENCE INTERVAL SCORING & REPORTING")
    print("=" * 80)

    import json
    import glob

    run_files = glob.glob(os.path.join(RESULTS_DIR, "runs_*.json"))
    if not run_files:
        print("[Score] No run files found in Evaluation/results/. Run step 2 first.")
        return {}

    # Load calibration metrics if available
    calib_file = os.path.join(RESULTS_DIR, "calibration_metrics.json")
    calib_info = {}
    if os.path.exists(calib_file):
        try:
            with open(calib_file, "r", encoding="utf-8") as f:
                calib_info = json.load(f)
        except Exception:
            pass

    overall_report = {
        "evaluation_title": "CognitRAG.ai Golden Dataset Benchmark Suite",
        "evaluated_at": datetime.now().isoformat(),
        "calibration": calib_info,
        "datasets": {}
    }

    md_report_lines = [
        "# CognitRAG.ai — Golden Dataset Evaluation & Benchmark Report\n",
        f"**Audit Timestamp:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  \n",
        "**Methodology:** Existing Human-Labeled Sets | Wilson Score 95% CI | Dual-Judge Calibration\n",
        "\n## 1. Dual-Judge Ensemble Calibration Summary\n"
    ]

    if calib_info:
        ov = calib_info.get("overall", {})
        pl = calib_info.get("per_label", {})
        md_report_lines.append(f"- **Sample Size (N):** {calib_info.get('n', 0)} (Balanced Human-Labeled Gold Pairs)\n")
        md_report_lines.append(f"- **Judge Models:** Judge A (`{calib_info.get('judge_a')}`) | Judge B (`{calib_info.get('judge_b')}`)\n")
        md_report_lines.append(f"- **Overall Agreement:** Judge A: {ov.get('judge_a_agreement', 0)*100:.1f}% | Judge B: {ov.get('judge_b_agreement', 0)*100:.1f}% | Inter-Judge: {ov.get('inter_judge_agreement', 0)*100:.1f}%\n")
        for lbl, stats in pl.items():
            md_report_lines.append(f"  - **Label `{lbl}` (N={stats.get('n', 0)}):** Judge A: {stats.get('judge_a_agreement', 0)*100:.1f}% | Judge B: {stats.get('judge_b_agreement', 0)*100:.1f}% | Inter: {stats.get('inter_judge_agreement', 0)*100:.1f}%\n")
        md_report_lines.append(f"- **Calibration Status:** `{calib_info.get('calibration_status', 'UNKNOWN')}` (Enforcing >=80% threshold per label class)\n")
    else:
        md_report_lines.append("- *Calibration data not found. Run step calibrate first.*\n")

    md_report_lines.append("\n## 2. Summary Benchmark Matrix\n")
    md_report_lines.append("| Dataset | Category / Task | Sample Size (N) | Accuracy / Score | 95% Confidence Interval | Statistical Status |\n")
    md_report_lines.append("| :--- | :--- | :---: | :---: | :---: | :---: |\n")

    for rf in run_files:
        d_name = os.path.basename(rf).replace("runs_", "").replace(".json", "")
        with open(rf, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        scores = score_dataset(data, category_field="task_type")
        overall_report["datasets"][d_name] = scores

        for cat, metric in scores.items():
            n_count = metric['n']
            stat_status = "Statistically sound" if n_count >= 30 else "Preliminary — below N=30"
            md_report_lines.append(
                f"| **{d_name.upper()}** | `{cat}` | {n_count} | **{metric['score_percent']}%** | `{metric['ci_range_percent']}` | *[{stat_status}]* |\n"
            )
            # Store in Supabase if configured
            store_supabase(
                dataset_name=d_name,
                category=cat,
                metric_name=f"{cat}_accuracy",
                report_row=metric
            )

    md_report_lines.append("\n## 3. Step-by-Step Human Audit Traces (Ingestion to Retrieval to Generation)\n")
    for rf in run_files:
        d_name = os.path.basename(rf).replace("runs_", "").replace(".json", "")
        with open(rf, "r", encoding="utf-8") as f:
            data = json.load(f)
        md_report_lines.append(f"\n### [{d_name.upper()}] Sample Traces\n")
        for sample in data[:2]:
            ex = sample.get("example", {})
            s1 = sample.get("step_1_input", {})
            s2 = sample.get("step_2_retrieval", {})
            s3 = sample.get("step_3_contradictions", [])
            s4 = sample.get("step_4_generation", {})
            md_report_lines.append(f"#### Example `{sample.get('example_id')}` ({sample.get('task_type')} | `{sample.get('language_tag')}`)\n")
            md_report_lines.append(f"- **Step 1 (Input & Language):** Query: *\"{s1.get('query')}\"* | Language Detected: `{s1.get('detected_language')}`\n")
            if s1.get('input_context'):
                md_report_lines.append(f"  - *Context Provided:* {str(s1.get('input_context'))[:180]}...\n")
            md_report_lines.append(f"- **Step 2 (Hybrid Retrieval & Graph):** {s2.get('chunks_retrieved_count', 0)} chunks retrieved | Graph: *{s2.get('graph_context') or 'Direct hybrid retrieval'}*\n")
            for c in s2.get("chunks", [])[:2]:
                md_report_lines.append(f"  - [{c.get('source_type', 'doc').upper()} - {c.get('derivation', 'extracted')}] (Conf: {c.get('confidence', 0.85):.2f}): {str(c.get('snippet', ''))[:120]}...\n")
            md_report_lines.append(f"- **Step 3 (Contradictions Flagged):** {len(s3)}\n")
            md_report_lines.append(f"- **Step 4 (Generation vs Gold Target):**\n")
            md_report_lines.append(f"  - **Generated:** {s4.get('generated_answer') or s4.get('answer') or 'N/A'}\n")
            md_report_lines.append(f"  - **Gold Target:** {s4.get('gold_answer') or s4.get('gold_label') or 'N/A'}\n\n")

    store_local(overall_report, filename="summary_metrics.json")
    
    md_path = os.path.join(RESULTS_DIR, "benchmark_report.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.writelines(md_report_lines)
    print(f"\n[Score] Full Markdown Benchmark Report saved to:\n  -> {md_path}")
    return overall_report


def main():
    parser = argparse.ArgumentParser(description="CognitRAG.ai Evaluation Suite CLI")
    parser.add_argument("--step", choices=["calibrate", "run", "score", "all"], default="all", help="Evaluation step to execute")
    parser.add_argument("--dataset", default="all", help="Dataset name to run (ragtruth, entrag, alce, comi-lingua, codemixed-qa, hifactmix, all)")
    parser.add_argument("--limit", type=int, default=2, help="Sample count per dataset for testing")
    parser.add_argument("--api-base", default="http://localhost:8000", help="CognitRAG API base URL")
    args = parser.parse_args()

    if args.step in ("calibrate", "all"):
        step_calibrate(sample_limit=args.limit if args.step == "calibrate" else 24)
    if args.step in ("run", "all"):
        step_run_datasets(dataset_name=args.dataset, limit=args.limit, api_base=args.api_base)
    if args.step in ("score", "all"):
        step_score_and_report()

    print("\n" + "=" * 80)
    print("ALL REQUESTED EVALUATION STEPS COMPLETED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    main()
