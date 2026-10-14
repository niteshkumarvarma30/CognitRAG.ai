"""
CognitRAG v4 — Tune K for Mixed Class Override
Analyzes the 21 misclassified traces from v2 (gold=mixed, pred=hi-latn)
and the 40 gold=hi-latn traces to determine the optimal K and regex.
"""
import json
import re
import os

traces_path = os.path.join(os.path.dirname(__file__), "..", "traces", "comi_revalidation_traces.json")
with open(traces_path, "r", encoding="utf-8") as f:
    data = json.load(f)

traces = data["traces"]
mixed_errors = [t for t in traces if t.get("gold_answer") == "mixed" and t.get("generated_answer") == "hi-latn"]
hi_latn_correct = [t for t in traces if t.get("gold_answer") == "hi-latn" and t.get("generated_answer") == "hi-latn"]
hi_latn_errors = [t for t in traces if t.get("gold_answer") == "hi-latn" and t.get("generated_answer") != "hi-latn"]
mixed_correct = [t for t in traces if t.get("gold_answer") == "mixed" and t.get("generated_answer") == "mixed"]

print(f"Total traces: {len(traces)}")
print(f"Gold mixed -> pred hi-latn errors: {len(mixed_errors)}")
print(f"Gold mixed -> pred mixed correct: {len(mixed_correct)}")
print(f"Gold hi-latn -> pred hi-latn correct: {len(hi_latn_correct)}")
print(f"Gold hi-latn -> pred mixed errors: {len(hi_latn_errors)}")
print("=" * 80)

print("\n--- The 40 Gold hi-latn Traces ---")
for idx, t in enumerate(traces):
    if t.get("gold_answer") == "hi-latn":
        print(f"{idx+1:02d}. ID: {t['example_id']} | Pred: {t['generated_answer']}")
        print(f"    Text: \"{t['input_query']}\"")


