import json
import os
from collections import Counter

def diagnose():
    traces_path = os.path.join("Evaluation", "results", "comi_lingua_traces.json")
    with open(traces_path, "r", encoding="utf-8") as f:
        traces = json.load(f)

    errors = [t for t in traces if not t["is_correct"]]
    print(f"Total evaluated: {len(traces)} | Total errors: {len(errors)}")

    patterns = Counter()
    for e in errors:
        gold = e["gold_label"]
        pred = e["predicted_label"]
        patterns[f"{gold}->{pred}"] += 1

    print("\nError pattern breakdown:")
    for pat, count in patterns.most_common():
        print(f"  {pat}: {count}")

    print("\n--- Detailed Inspection of hi-latn Errors (Gold: hi-latn, Pred: mixed or en) ---")
    hi_errors = [e for e in errors if e["gold_label"] == "hi-latn"]
    for i, e in enumerate(hi_errors):
        pred = e["predicted_label"]
        txt = e["text"]
        print(f"{i+1:02d}. [hi-latn -> {pred}] (len={len(txt.split())} words) \"{txt}\"")

    print("\n--- Detailed Inspection of mixed Errors (Gold: mixed, Pred: hi-latn or en) ---")
    mixed_errors = [e for e in errors if e["gold_label"] == "mixed"]
    for i, e in enumerate(mixed_errors):
        pred = e["predicted_label"]
        txt = e["text"]
        print(f"{i+1:02d}. [mixed -> {pred}] (len={len(txt.split())} words) \"{txt}\"")

if __name__ == "__main__":
    diagnose()
