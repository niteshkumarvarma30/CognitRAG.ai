import re
from Evaluation.loaders.codemixed_qa_loader import load_codemixed_qa
from Evaluation.run_pipeline import run_example
from Evaluation.judge import judge_citation

examples = load_codemixed_qa(limit=1)
ex0 = examples[0]
res = run_example(ex0)
gen_ans = res.get('answer', '')
gold_ans = ex0.gold_answer

def check_match(gold: str, pred: str) -> bool:
    g_clean = re.sub(r'[^a-zA-Z0-9]', '', gold).lower()
    p_clean = re.sub(r'[^a-zA-Z0-9]', '', pred).lower()
    return bool(g_clean and g_clean in p_clean)

em = check_match(gold_ans, gen_ans)

claim = f"Question: {ex0.input_query} Gold Answer: {gold_ans}. Generated Answer: {gen_ans}"
verdict_a = judge_citation(claim, ex0.input_context, model='openai/gpt-oss-20b')
verdict_b = judge_citation(claim, ex0.input_context, model='qwen/qwen3.8-27b')

print("Question:", ex0.input_query)
print("Gold:", gold_ans)
print("Generated:", gen_ans)
print("Exact/Substring Match:", em)
print("Judge A (openai/gpt-oss-20b):", verdict_a)
print("Judge B (qwen/qwen3.8-27b):", verdict_b)
