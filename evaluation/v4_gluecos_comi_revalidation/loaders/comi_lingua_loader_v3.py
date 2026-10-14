"""
CognitRAG v4 — COMI-LINGUA v3 Loader
Strictly excludes all 200 example_ids from both v1 (N=120) and v2 (N=80).
Uses seed=7 for a completely fresh third out-of-sample evaluation.
Note: English (en) is exhausted in COMI-LINGUA (39 total in dataset, all used in v1).
"""
import ast, re, random, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))

PRIOR_V1_V2_IDS_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'prior_comi_ids_v1_v2.json')
DEVANAGARI_PAT = re.compile(r'[\u0900-\u097F]')


def load_prior_ids_v1_v2() -> set:
    with open(PRIOR_V1_V2_IDS_PATH) as f:
        data = json.load(f)
    return set(data["prior_ids"])


def _parse_tokens(ann_str: str) -> list[str]:
    try:
        parsed = ast.literal_eval(ann_str)
        return [
            x.get("value") if isinstance(x, dict) else x[1]
            for x in parsed if isinstance(x, (dict, list, tuple))
        ]
    except Exception:
        return []


def derive_label(tokens: list[str]) -> str | None:
    hi = sum(1 for t in tokens if t == "hi")
    en = sum(1 for t in tokens if t == "en")
    if en > 0 and hi == 0:
        return "en"
    if hi > 0 and en == 0:
        return "hi-latn"
    if hi > 0 and en > 0:
        return "mixed"
    return None


def load_comi_v3_out_of_sample(n_per_label: int = 40, seed: int = 7) -> list[dict]:
    """
    Returns out-of-sample COMI-LINGUA rows with derived sentence-level gold labels.
    Strictly excludes all 200 example_ids from both v1 and v2.
    """
    from datasets import load_dataset

    prior_ids = load_prior_ids_v1_v2()
    print(f"[COMI v3 Loader] Prior IDs to exclude (v1 + v2): {len(prior_ids)}")

    ds = load_dataset("LingoIITGN/COMI-LINGUA", "LID", split="train")
    print(f"[COMI v3 Loader] Full LID dataset size: {len(ds)}")

    by_label = {"en": [], "hi-latn": [], "mixed": []}
    skipped_devanagari = 0
    skipped_prior = 0
    skipped_short = 0
    skipped_no_ann = 0

    for i, row in enumerate(ds):
        row_id = f"comi_lid_{i}"

        # Exclude all prior v1 and v2 IDs
        if row_id in prior_ids:
            skipped_prior += 1
            continue

        sent = row.get("Sentences", "")

        # Skip Devanagari (keep Romanized only)
        if DEVANAGARI_PAT.search(sent):
            skipped_devanagari += 1
            continue

        # Min length: at least 3 words
        if len(sent.split()) < 3:
            skipped_short += 1
            continue

        ann1 = row.get("Annotated by: Annotator 1", "")
        if not ann1:
            skipped_no_ann += 1
            continue

        tokens = _parse_tokens(ann1)
        label = derive_label(tokens)
        if label is None:
            continue

        by_label[label].append({
            "example_id": row_id,
            "text": sent,
            "gold_label": label,
        })

    print(f"[COMI v3 Loader] Skipped — Devanagari: {skipped_devanagari} | "
          f"Prior IDs: {skipped_prior} | Short: {skipped_short} | No ann: {skipped_no_ann}")
    print(f"[COMI v3 Loader] Available per label (after v1+v2 exclusion): "
          f"{ {k: len(v) for k, v in by_label.items()} }")

    # Document English exhaustion explicitly
    if len(by_label["en"]) == 0:
        print("[COMI v3 Loader] Permanent limitation: English (en) is dataset-exhausted. 0 examples available.")

    rng = random.Random(seed)
    sample = []
    for label in ["hi-latn", "mixed"]:
        pool = list(by_label[label])
        rng.shuffle(pool)
        take = min(n_per_label, len(pool))
        sample.extend(pool[:take])

    rng.shuffle(sample)

    # Verify zero overlap with prior IDs
    sampled_ids = {r["example_id"] for r in sample}
    overlap = sampled_ids & prior_ids
    assert len(overlap) == 0, f"STOP: {len(overlap)} prior IDs leaked into new sample!"

    achieved = {}
    for r in sample:
        achieved.setdefault(r["gold_label"], 0)
        achieved[r["gold_label"]] += 1
    print(f"[COMI v3 Loader] Achieved distribution: {achieved}, Total: {len(sample)}")
    print(f"[COMI v3 Loader] Zero prior overlap verified: [OK]")

    return sample

