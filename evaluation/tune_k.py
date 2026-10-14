import json
with open('results/runs_comi-lingua.json', 'r', encoding='utf-8') as f:
    runs = json.load(f)

misclassified = [r for r in runs if not r.get('response', {}).get('is_correct')]
with open('tune_k_out.txt', 'w', encoding='utf-8') as out:
    out.write(f'Total misclassified: {len(misclassified)}\n')
    for r in misclassified:
        ex = r.get('example', {})
        resp = r.get('response', {})
        out.write(f"[{ex.get('example_id')}] Q: {ex.get('input_query')}\n")
        out.write(f"  Gold: {ex.get('gold_label')} | Gen: {resp.get('answer')} | Correct: {resp.get('is_correct')}\n\n")
