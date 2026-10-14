import ast
import json
from datasets import load_dataset

ds = load_dataset("LingoIITGN/COMI-LINGUA", "LID", split="train")
print(f"Loaded LID with {len(ds)} rows.")

label_patterns = {}
for i in range(min(500, len(ds))):
    row = ds[i]
    sent = row['Sentences']
    ann1 = row.get('Annotated by: Annotator 1')
    tags = []
    if ann1:
        try:
            parsed = ast.literal_eval(ann1)
            if isinstance(parsed, list):
                tags = [x.get('value') if isinstance(x, dict) else (x[1] if isinstance(x, (list, tuple)) else str(x)) for x in parsed]
        except Exception:
            pass
    
    unique_tags = tuple(sorted(set(tags))) if tags else ("NONE",)
    label_patterns[unique_tags] = label_patterns.get(unique_tags, 0) + 1

print("Top label value combinations across first 500 rows:")
for k, v in sorted(label_patterns.items(), key=lambda x: -x[1])[:15]:
    print(f"  {k}: {v}")

# Also check test split if available
try:
    ds_test = load_dataset("LingoIITGN/COMI-LINGUA", "LID", split="test")
    print(f"Test split length: {len(ds_test)}")
except Exception as e:
    print(f"No test split or error: {e}")
