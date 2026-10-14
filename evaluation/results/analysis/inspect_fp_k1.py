"""
Inspect the 9 false mixed cases in hi-latn when K=1
"""
import json
import re
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))
from Evaluation.v4_gluecos_comi_revalidation.analysis.tune_k_eval import extract_capitalized_and_english_tokens

traces_path = os.path.join(os.path.dirname(__file__), "..", "traces", "comi_revalidation_traces.json")
with open(traces_path, "r", encoding="utf-8") as f:
    traces = json.load(f)["traces"]

print("=== False Mixed cases in gold hi-latn when K=1 ===")
for t in traces:
    if t["gold_answer"] == "hi-latn":
        markers = extract_capitalized_and_english_tokens(t["input_query"])
        if len(markers) >= 1:
            print(f"[{t['example_id']}] Markers: {markers}")
            print(f"    Text: \"{t['input_query']}\"\n")
