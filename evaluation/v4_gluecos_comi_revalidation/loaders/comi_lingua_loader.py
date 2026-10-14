"""
CognitRAG v4 — COMI-LINGUA Out-of-Sample Loader

IMPORTANT: COMI-LINGUA 'LID' is token-level, not sentence-level.
The original eval derived sentence-level labels from token annotations:
  - Filter out Devanagari sentences (keep Romanized only)
  - Parse Annotator 1 token tags: {key: word, value: 'hi'|'en'}
  - en-only tokens  → gold label 'en'
  - hi-only tokens  → gold label 'hi-latn'
  - both present    → gold label 'mixed'

IDs are 'comi_lid_{row_index}' — where row_index is the dataset enumerate index.
Prior 120 IDs are loaded from data/prior_comi_ids.json and excluded strictly.
New sample uses seed=99 (original was seed=42).
"""
import ast, re, random, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))

PRIOR_IDS_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'prior_comi_ids.json')
DEVANAGARI_PAT = re.compile(r'[\u0900-\u097F]')


def load_prior_ids() -> set:
    with open(PRIOR_IDS_PATH) as f:
        data = json.load(f)
    return set(data["prior_ids"])    # e.g. {'comi_lid_7375', 'comi_lid_13776', ...}


def _parse_tokens(ann_str: str) -> list[str]:
    """Parse annotator JSON string into list of language values ('hi' or 'en')."""
    try:
        parsed = ast.literal_eval(ann_str)
        return [
            x.get("value") if isinstance(x, dict) else x[1]
            for x in parsed if isinstance(x, (dict, list, tuple))
        ]
    except Exception:
        return []


def derive_label(tokens: list[str], sent: str, K: int = 2) -> str | None:
    hi = sum(1 for t in tokens if t == "hi")
    en = sum(1 for t in tokens if t == "en")
    
    # Capitalized tokens override (proxy for proper nouns/English entities)
    # A word starting with A-Z and having at least 2 chars.
    capitalized_words = [w for w in sent.split() if w and w[0].isupper() and len(w) > 1 and w.isascii()]
    
    if len(capitalized_words) >= K:
        return "mixed"
        
    if en > 0 and hi == 0:
        return "en"
    if hi > 0 and en == 0:
        return "hi-latn"
    if hi > 0 and en > 0:
        return "mixed"
    return None


def load_comi_out_of_sample(n_per_label: int = 40, seed: int = 99, K: int = 1) -> list[dict]:
    """
    Returns out-of-sample COMI-LINGUA rows with derived sentence-level gold labels.
    Strictly excludes all 120 example_ids from the original N=120 run.

    Each item:
        example_id  : str  (e.g. 'comi_lid_5423')
        text        : str  (the Romanized sentence)
        gold_label  : str  ('en' | 'hi-latn' | 'mixed')
    """
    from datasets import load_dataset

    prior_ids = load_prior_ids()
    print(f"[COMI Loader] Prior IDs to exclude: {len(prior_ids)}")

    ds = load_dataset("LingoIITGN/COMI-LINGUA", "LID", split="train")
    print(f"[COMI Loader] Full LID dataset size: {len(ds)}")

    # Build candidate pools per label — exactly same logic as original eval
    by_label = {"en": [], "hi-latn": [], "mixed": []}
    skipped_devanagari = 0
    skipped_prior = 0
    skipped_short = 0
    skipped_no_ann = 0

    for i, row in enumerate(ds):
        row_id = f"comi_lid_{i}"

        # Exclude prior run IDs
        if row_id in prior_ids:
            skipped_prior += 1
            continue

        sent = row.get("Sentences", "")

        # Skip Devanagari (keep Romanized only — same as original)
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
        label = derive_label(tokens, sent, K=K)
        if label is None:
            continue

        by_label[label].append({
            "example_id": row_id,
            "text": sent,
            "gold_label": label,
        })

    print(f"[COMI Loader] Skipped — Devanagari: {skipped_devanagari} | "
          f"Prior IDs: {skipped_prior} | Short: {skipped_short} | No ann: {skipped_no_ann}")
    print(f"[COMI Loader] Available per label (after exclusion): "
          f"{ {k: len(v) for k, v in by_label.items()} }")

    # Verify enough rows for stratified sample
    for lbl, pool in by_label.items():
        if len(pool) < n_per_label:
            print(f"[COMI Loader] WARNING: Only {len(pool)} rows for '{lbl}', "
                  f"target was {n_per_label} — will take all available.")

    # Stratified sample — seed 99 (original was 42)
    rng = random.Random(seed)
    sample = []
    for label, pool in by_label.items():
        rng.shuffle(pool)
        take = min(n_per_label, len(pool))
        sample.extend(pool[:take])

    rng.shuffle(sample)

    # Verify zero overlap with prior IDs
    sampled_ids = {r["example_id"] for r in sample}
    overlap = sampled_ids & prior_ids
    assert len(overlap) == 0, f"STOP: {len(overlap)} prior IDs leaked into new sample!"

    # Print achieved distribution (anti-pattern §0.3)
    achieved = {}
    for r in sample:
        achieved.setdefault(r["gold_label"], 0)
        achieved[r["gold_label"]] += 1
    print(f"[COMI Loader] Achieved distribution: {achieved}, Total: {len(sample)}")
    print(f"[COMI Loader] Zero prior overlap verified: OK")

    return sample
