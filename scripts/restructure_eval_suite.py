import os
import shutil
import glob

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def restructure():
    target_root = os.path.join(PROJECT_ROOT, "eval_suite")
    os.makedirs(target_root, exist_ok=True)

    # 1. 01_baseline_and_refixes (From eval/results/ >= Sept 4)
    dir_01 = os.path.join(target_root, "01_baseline_and_refixes")
    os.makedirs(dir_01, exist_ok=True)
    eval_results_src = os.path.join(PROJECT_ROOT, "eval", "results")
    if os.path.exists(eval_results_src):
        for f in os.listdir(eval_results_src):
            src_f = os.path.join(eval_results_src, f)
            if os.path.isfile(src_f):
                shutil.copy2(src_f, os.path.join(dir_01, f))
    print(f"Copied {len(os.listdir(dir_01))} baseline & refix result files to 01_baseline_and_refixes")

    # 2. 02_enterprise_8stage_audit (From enterprise_audit_package)
    dir_02 = os.path.join(target_root, "02_enterprise_8stage_audit")
    os.makedirs(dir_02, exist_ok=True)
    audit_src = os.path.join(PROJECT_ROOT, "enterprise_audit_package")
    if os.path.exists(audit_src):
        # copy datasets, reports, scripts, stage_traces, and README_AUDIT_GUIDE.md
        for item in ["README_AUDIT_GUIDE.md", "reports", "stage_traces", "datasets", "scripts"]:
            src_item = os.path.join(audit_src, item)
            dst_item = os.path.join(dir_02, item)
            if os.path.isfile(src_item):
                shutil.copy2(src_item, dst_item)
            elif os.path.isdir(src_item):
                if os.path.exists(dst_item):
                    shutil.rmtree(dst_item)
                shutil.copytree(src_item, dst_item)
    print("Copied enterprise 8-stage audit package to 02_enterprise_8stage_audit")

    # 3. 03_ragas_and_deepeval (From enterprise_audit_package/ragas_and_deepeval)
    dir_03 = os.path.join(target_root, "03_ragas_and_deepeval")
    os.makedirs(dir_03, exist_ok=True)
    ragas_src = os.path.join(PROJECT_ROOT, "enterprise_audit_package", "ragas_and_deepeval")
    if os.path.exists(ragas_src):
        for item in ["reports", "scripts", "datasets"]:
            src_item = os.path.join(ragas_src, item)
            dst_item = os.path.join(dir_03, item)
            if os.path.isdir(src_item):
                if os.path.exists(dst_item):
                    shutil.rmtree(dst_item)
                shutil.copytree(src_item, dst_item)
    print("Copied RAGAS and DeepEval suite to 03_ragas_and_deepeval")

    # 4. 04_master_reports
    dir_04 = os.path.join(target_root, "04_master_reports")
    os.makedirs(dir_04, exist_ok=True)
    master_report_files = [
        "full_eval_summary.md",
        "real_human_evaluation.md",
        "COGNITRAG_ARCHITECTURE_EVALUATION_AND_INTERVIEW_GUIDE.md",
    ]
    for mf in master_report_files:
        src = os.path.join(PROJECT_ROOT, mf)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(dir_04, mf))

    # Also copy regression_summary.md and comparative_audit.md
    reg_src = os.path.join(PROJECT_ROOT, "eval", "reports", "regression_summary.md")
    if os.path.exists(reg_src):
        shutil.copy2(reg_src, os.path.join(dir_04, "regression_summary.md"))

    comp_src = os.path.join(PROJECT_ROOT, "enterprise_audit_package", "ragas_and_deepeval", "reports", "comparative_audit.md")
    if os.path.exists(comp_src):
        shutil.copy2(comp_src, os.path.join(dir_04, "comparative_audit.md"))
    print("Copied consolidated master reports to 04_master_reports")

    # 5. legacy_archive (Files created before 2026-09-04)
    dir_legacy = os.path.join(target_root, "legacy_archive")
    os.makedirs(dir_legacy, exist_ok=True)

    # final_benchmark_results
    fbr_src = os.path.join(PROJECT_ROOT, "final_benchmark_results")
    if os.path.exists(fbr_src):
        dst_fbr = os.path.join(dir_legacy, "final_benchmark_results_pre_sept4")
        if os.path.exists(dst_fbr):
            shutil.rmtree(dst_fbr)
        shutil.move(fbr_src, dst_fbr)
        print("Moved final_benchmark_results to legacy_archive")

    # old data files
    old_data_files = [
        "aws_100_benchmark.json",
        "aws_benchmark_dataset.json",
        "benchmark_30_questions.json",
        "benchmark_dataset.json"
    ]
    for of in old_data_files:
        src = os.path.join(PROJECT_ROOT, "data", of)
        if os.path.exists(src):
            shutil.move(src, os.path.join(dir_legacy, of))
            print(f"Moved data/{of} to legacy_archive")

    # old doc / report files
    old_root_eval = os.path.join(PROJECT_ROOT, "evaluation_report.md")
    if os.path.exists(old_root_eval):
        shutil.move(old_root_eval, os.path.join(dir_legacy, "evaluation_report_aug28.md"))
        print("Moved evaluation_report.md to legacy_archive")

    old_doc_metrics = os.path.join(PROJECT_ROOT, "docs", "final_eval_metrics.md")
    if os.path.exists(old_doc_metrics):
        shutil.move(old_doc_metrics, os.path.join(dir_legacy, "final_eval_metrics_aug19.md"))
        print("Moved docs/final_eval_metrics.md to legacy_archive")

    # Clean loose duplicate files at root to keep root clean
    loose_duplicates = [
        "human_evaluation.md",  # duplicate of real_human_evaluation.md / eval/reports
        "source_data.md"
    ]
    for lf in loose_duplicates:
        src = os.path.join(PROJECT_ROOT, lf)
        if os.path.exists(src):
            shutil.move(src, os.path.join(dir_legacy, lf))
            print(f"Archived loose file {lf} to legacy_archive")

    print("\nRestructuring completed successfully!")

if __name__ == "__main__":
    restructure()
