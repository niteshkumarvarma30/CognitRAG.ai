import ast
from datasets import load_dataset

ds = load_dataset('LingoIITGN/COMI-LINGUA', 'LID', split='train')
row_indices = [8624, 20118, 7420, 4861, 7921, 9826, 5641, 14353, 14631, 15597, 8134, 4117, 9435, 15693, 11190, 19582, 14038, 5394, 15633, 14983, 4129]

print("=== EXACT 'en' TOKENS LABELED BY ANNOTATOR 1 ===")
for idx in row_indices:
    row = ds[idx]
    ann = ast.literal_eval(row['Annotated by: Annotator 1'])
    en_toks = [x['key'] for x in ann if isinstance(x, dict) and x.get('value') == 'en']
    hi_toks = [x['key'] for x in ann if isinstance(x, dict) and x.get('value') == 'hi']
    ot_toks = [x['key'] for x in ann if isinstance(x, dict) and x.get('value') == 'ot']
    print(f"Row {idx:05d}: en({len(en_toks)})={en_toks}")
    print(f"           hi({len(hi_toks)})={hi_toks}")
    print(f"           Sentence: \"{row['Sentences']}\"\n")
