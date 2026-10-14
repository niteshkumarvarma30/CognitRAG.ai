"""
CognitRAG v4 — HGQA Loader
Loads rajpurkar/squad_v2 validation split.
Filters unanswerable rows (empty answers).
Applies stratified sampling by article topic.
Wraps questions in Hinglish prefix (fixed seed).
"""
import random
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))

HINGLISH_PREFIXES = [
    "Bhai,", "Yaar,", "Koi batao,", "Arey,", "Suno,",
    "Bata do,", "Yaar bata,", "Kya hua,", "Samjhao,"
]

def load_hgqa(n: int = 60, seed: int = 42) -> list[dict]:
    """
    Returns N examples from SQuAD v2 with Hinglish-wrapped questions.
    Every returned row has a real, non-empty context passage.

    Each item:
        example_id    : str
        input_query   : str  (Hinglish-wrapped question)
        input_context : str  (real SQuAD passage)
        gold_answer   : str  (first gold answer text)
        original_q    : str  (unwrapped English question for tracing)
        title         : str  (article topic — used for stratification)
    """
    from datasets import load_dataset
    ds = load_dataset("rajpurkar/squad_v2", split="validation")

    # Step 1: Keep only answerable rows (SQuAD v2 has ~50% unanswerable)
    answerable = [row for row in ds if row["answers"]["text"]]

    # Verify: print achieved distribution info
    titles = {}
    for row in answerable:
        titles.setdefault(row["title"], 0)
        titles[row["title"]] += 1

    print(f"[HGQA Loader] Answerable rows: {len(answerable)} / {len(ds)}")
    print(f"[HGQA Loader] Unique article topics: {len(titles)}")

    # Verify: zero placeholder context rows
    empty_ctx = [r for r in answerable if len(r["context"].strip()) < 50]
    print(f"[HGQA Loader] Rows with context < 50 chars (should be 0): {len(empty_ctx)}")
    assert len(empty_ctx) == 0, "STOP: placeholder context rows detected"

    # Step 2: Stratified sampling by title
    rng = random.Random(seed)
    by_title = {}
    for row in answerable:
        by_title.setdefault(row["title"], []).append(row)

    titles_list = sorted(by_title.keys())
    rng.shuffle(titles_list)

    # Round-robin across topics until we have N examples
    sampled = []
    i = 0
    seen_ids = set()
    while len(sampled) < n:
        title = titles_list[i % len(titles_list)]
        rows = by_title[title]
        candidate = rng.choice(rows)
        if candidate["id"] not in seen_ids:
            seen_ids.add(candidate["id"])
            sampled.append(candidate)
        i += 1
        if i > n * 50:
            break  # safety exit

    print(f"[HGQA Loader] Sampled: {len(sampled)} (target {n})")

    # Step 3: Wrap questions in Hinglish prefix (round-robin, seeded)
    prefix_rng = random.Random(seed + 1)
    result = []
    for idx, row in enumerate(sampled):
        prefix = prefix_rng.choice(HINGLISH_PREFIXES)
        hinglish_q = f"{prefix} {row['question']}"
        result.append({
            "example_id": f"hgqa_{row['id']}",
            "input_query": hinglish_q,
            "input_context": row["context"],
            "gold_answer": row["answers"]["text"][0],
            "original_q": row["question"],
            "title": row["title"],
        })

    # Print achieved distribution (anti-pattern §0.3)
    topic_counts = {}
    for r in result:
        topic_counts.setdefault(r["title"], 0)
        topic_counts[r["title"]] += 1
    print(f"[HGQA Loader] Topics covered: {len(topic_counts)}")
    print(f"[HGQA Loader] Samples per topic (top 5): {sorted(topic_counts.items(), key=lambda x:-x[1])[:5]}")

    return result
