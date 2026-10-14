import os
import csv
from typing import List, Optional
from Evaluation.schema import EvalExample

def load_codemixed_qa(path_to_tsv: Optional[str] = None, limit: Optional[int] = None) -> List[EvalExample]:
    """
    Loads Code-Mixed Hinglish Question Answering dataset.
    Reads TSV/CSV if provided, otherwise loads curated Hinglish QA pairs.
    """
    out: List[EvalExample] = []
    # 1. Load from local cached Chandu et al. (ACL 2018) Code-Mixed QA dataset
    default_json = os.path.join(os.path.dirname(__file__), "..", "data", "code_mixed_qa_train.json")
    if os.path.exists(default_json):
        try:
            import json
            with open(default_json, "r", encoding="utf-8") as f:
                data = json.load(f)
            questions = data.get("questions", [])
            for idx, q in enumerate(questions):
                if limit and idx >= limit:
                    break
                out.append(EvalExample(
                    example_id=str(q.get("id", f"cm_{idx}")),
                    dataset_name="codemixed-qa",
                    task_type="qa",
                    input_query=q.get("query"),
                    input_context=q.get("context"),
                    gold_answer=q.get("answer"),
                    gold_label="SUPPORTED",
                    language_tag="hi-latn",
                    metadata={"source": "chandu_2018_acl", "original_language": q.get("language")}
                ))
            if out:
                return out
        except Exception as e:
            print(f"[CodeMixed QA Loader] Error reading local JSON: {e}")

    if path_to_tsv and os.path.exists(path_to_tsv):
        try:
            with open(path_to_tsv, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f, delimiter="\t")
                for idx, row in enumerate(reader):
                    if limit and idx >= limit:
                        break
                    out.append(EvalExample(
                        example_id=str(row.get("qid", f"cm_{idx}")),
                        dataset_name="codemixed-qa",
                        task_type="qa",
                        input_query=row.get("question") or row.get("query"),
                        gold_answer=row.get("answer"),
                        language_tag="hi-latn",
                        metadata={"source_tsv": path_to_tsv}
                    ))
            return out
        except Exception as e:
            print(f"[CodeMixed QA Loader] Error reading {path_to_tsv}: {e}")

    # Golden technical Hinglish QA pairs
    samples = [
        {
            "id": "cm_gold_01",
            "question": "Staging pe Stripe checkout error kis PR mein solve hua tha?",
            "context": "GitHub Pull Request #45 updated Stripe API keys and fixed staging 401 error.",
            "answer": "PR #45",
            "gold_label": "SUPPORTED"
        },
        {
            "id": "cm_gold_02",
            "question": "Billing migration kab tak complete hone wali hai according to PRD?",
            "context": "Q3 Stripe Migration PRD target launch delivery date is committed for October 15, 2024.",
            "answer": "October 15, 2024",
            "gold_label": "SUPPORTED"
        },
        {
            "id": "cm_gold_03",
            "question": "BILL-101 ticket kisne assign kiya tha aur kisne resolve kiya?",
            "context": "Jira ticket BILL-101 was filed by Sarah Jenkins and resolved by John Doe via PR #45.",
            "answer": "Filed by Sarah Jenkins and resolved by John Doe.",
            "gold_label": "SUPPORTED"
        }
    ]
    for s in (samples[:limit] if limit else samples):
        out.append(EvalExample(
            example_id=s["id"],
            dataset_name="codemixed-qa",
            task_type="qa",
            input_query=s["question"],
            input_context=s["context"],
            gold_answer=s["answer"],
            gold_label=s["gold_label"],
            language_tag="hi-latn",
            metadata={"source": "codemixed_curated_gold"}
        ))

    return out
