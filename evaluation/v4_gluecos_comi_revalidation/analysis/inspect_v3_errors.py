"""
Inspect v3 traces and annotator labels
"""
import json
import ast
from datasets import load_dataset

with open('Evaluation/v4_gluecos_comi_revalidation/traces/comi_v3_traces.json', 'r', encoding='utf-8') as f:
    traces = json.load(f)['traces']

mixed_to_hi = [t for t in traces if t['gold_answer'] == 'mixed' and t['generated_answer'] == 'hi-latn']
print(f"Total mixed misclassified in v3: {len(mixed_to_hi)}\n")

ds = load_dataset('LingoIITGN/COMI-LINGUA', 'LID', split='train')

for idx, t in enumerate(mixed_to_hi, 1):
    ex_id = t['example_id']
    row_num = int(ex_id.replace('comi_lid_', ''))
    row = ds[row_num]
    ann = ast.literal_eval(row['Annotated by: Annotator 1'])
    en_toks = [x['key'] for x in ann if isinstance(x, dict) and x.get('value') == 'en']
    hi_toks = [x['key'] for x in ann if isinstance(x, dict) and x.get('value') == 'hi']
    ot_toks = [x['key'] for x in ann if isinstance(x, dict) and x.get('value') == 'ot']
    print(f"{idx:02d}. [{ex_id}] Text: \"{t['input_query']}\"")
    print(f"    Annotator 1 'en' tokens: {en_toks}")
    print(f"    Annotator 1 'hi' tokens: {hi_toks[:10]}...")
    print()
