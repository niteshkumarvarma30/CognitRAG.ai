import os
import json
from datetime import datetime
from typing import Dict, Any, Optional

RESULTS_DIR = os.path.join(os.path.dirname(__file__), "results")

def store_local(benchmark_summary: Dict[str, Any], filename: str = "summary_metrics.json") -> str:
    """
    Saves the benchmark summary locally in Evaluation/results/.
    """
    os.makedirs(RESULTS_DIR, exist_ok=True)
    out_path = os.path.join(RESULTS_DIR, filename)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(benchmark_summary, f, indent=2)
    print(f"[Store Local] Saved metrics to {out_path}")
    return out_path


def store_supabase(dataset_name: str,
                   category: str,
                   metric_name: str,
                   report_row: Dict[str, Any],
                   eval_method: str = "llm_judge_calibrated",
                   judge_model: Optional[str] = "openai/gpt-oss-120b",
                   calibration_agreement: Optional[float] = 0.90,
                   dataset_version: str = "v1.0",
                   methodology_url: Optional[str] = "https://cognitrag.ai/benchmarks") -> bool:
    """
    Stores a benchmark run metric into Supabase 'benchmark_runs' table if available.
    Fails gracefully without breaking offline evaluations.
    """
    try:
        from src.database.supabase_client import SupabaseManager
        sm = SupabaseManager()
        db = sm.get_admin_client()
        record = {
            "dataset_name": dataset_name,
            "category": category,
            "metric_name": metric_name,
            "metric_value": report_row.get("score", 0.0),
            "ci_low": report_row.get("ci_low"),
            "ci_high": report_row.get("ci_high"),
            "sample_size": report_row.get("n", 0),
            "eval_method": eval_method,
            "judge_model": judge_model,
            "calibration_agreement": calibration_agreement,
            "dataset_version": dataset_version,
            "methodology_url": methodology_url
        }
        try:
            db.table("eval_benchmark_runs").insert(record).execute()
            print(f"[Store Supabase] Recorded {dataset_name} [{category}] metric to public.eval_benchmark_runs.")
        except Exception as e1:
            try:
                db.schema("eval").table("benchmark_runs").insert(record).execute()
                print(f"[Store Supabase] Recorded {dataset_name} [{category}] metric to eval.benchmark_runs.")
            except Exception:
                db.table("benchmark_runs").insert(record).execute()
                print(f"[Store Supabase] Recorded {dataset_name} [{category}] metric to public.benchmark_runs.")
        return True
    except Exception as e:
        print(f"[Store Supabase] Note: Supabase insert skipped ({e}). Saved locally.")
        return False
