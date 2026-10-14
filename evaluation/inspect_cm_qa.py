import json

with open("Evaluation/data/code_mixed_qa_train.json", "r", encoding="utf-8") as f:
    data = json.load(f)

questions = data.get("questions", [])
print(f"Total questions: {len(questions)}")
print("Sample 0:", json.dumps(questions[0], indent=2))
print("Sample 1:", json.dumps(questions[1], indent=2))

categories = set()
languages = set()
for q in questions:
    for k in q:
        if "cat" in k.lower() or "topic" in k.lower() or "diff" in k.lower():
            categories.add(k)
    languages.add(q.get("language"))

print("Metadata keys found:", categories)
print("Languages found:", languages)
