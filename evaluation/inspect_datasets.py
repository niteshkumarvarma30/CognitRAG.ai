import sys
import json
from datasets import load_dataset

print("--- COMI-LINGUA INSPECTION ---")
ds = load_dataset("LingoIITGN/COMI-LINGUA", "LID", split="train")
print("Features:", ds.features)
print("Length:", len(ds))

# Sample 3 items safely
for i in range(3):
    row = ds[i]
    # safe print
    clean_row = {k: (str(v)[:200] if not isinstance(v, (int, float, bool)) else v) for k, v in row.items()}
    print(f"Row {i}:", json.dumps(clean_row, ensure_ascii=True, indent=2))

# Inspect task/subset names or configs if available
print("\nChecking first 20 rows for label/task structures:")
labels_found = set()
for i in range(min(100, len(ds))):
    row = ds[i]
    for k in row:
        if "annotat" in k.lower() or "tag" in k.lower() or "label" in k.lower() or "pred" in k.lower():
            labels_found.add((k, type(row[k]).__name__, str(row[k])[:80]))

for item in labels_found:
    print("Found key/tag candidate:", item)
