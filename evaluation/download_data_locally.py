import os
import sys
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from Evaluation.loaders import (
    load_ragtruth,
    load_entrag,
    load_alce,
    load_comi_lingua,
    load_codemixed_qa,
    load_hifactmix
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def dump_all_datasets(limit: int = 50):
    os.makedirs(DATA_DIR, exist_ok=True)
    datasets = {
        "ragtruth": load_ragtruth(limit=limit),
        "entrag": load_entrag(limit=limit),
        "alce": load_alce(limit=limit),
        "comi-lingua": load_comi_lingua(limit=limit),
        "codemixed-qa": load_codemixed_qa(limit=limit),
        "hifactmix": load_hifactmix(limit=limit),
    }

    print(f"[Data Sync] Exporting golden datasets to local directory: {DATA_DIR}")
    for name, examples in datasets.items():
        out_path = os.path.join(DATA_DIR, f"{name}.json")
        serialized = [ex.model_dump() for ex in examples]
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(serialized, f, indent=2, ensure_ascii=False)
        print(f"  -> Saved {len(serialized)} items to Evaluation/data/{name}.json")

    print("[Data Sync] All benchmark datasets are now physically stored in Evaluation/data/!")

if __name__ == "__main__":
    dump_all_datasets(limit=50)
