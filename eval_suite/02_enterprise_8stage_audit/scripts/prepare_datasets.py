import json
import shutil

# 1. Copy entity resolution 100
shutil.copy2('eval/datasets/entity_resolution_100.json', 'enterprise_audit_package/datasets/entity_resolution_100.json')

# 2. Load real_enterprise_rag_50.json and align SEC queries
with open('eval/datasets/real_enterprise_rag_50.json', 'r', encoding='utf-8') as f:
    queries = json.load(f)

for q in queries:
    if q['id'] == 'real_sec_41':
        q['ground_truth'] = "Microsoft's effective tax rate for fiscal year 2024 was 18.2%, compared to 19.0% in 2023 and 13.1% in 2022."
    elif q['id'] == 'real_sec_42':
        q['query'] = "What was the total provision for income taxes and the foreign tax rate effect in Microsoft Note 12 for 2024?"
        q['ground_truth'] = "Total provision for income taxes was $19,651 million ($24,389M current and $(4,738)M deferred). Foreign earnings taxed at lower rates had a (1.4)% effect reducing taxes by approximately $1,509 million."
    elif q['id'] == 'real_sec_43':
        q['query'] = "How much total cash, cash equivalents, and short-term investments did Microsoft report on its balance sheet for June 30, 2024?"
        q['ground_truth'] = "Total cash, cash equivalents, and short-term investments as of June 30, 2024 was $75,543 million (comprising $18,315 million in cash and cash equivalents and $57,228 million in short-term investments)."
    elif q['id'] == 'real_sec_44':
        q['query'] = "What service credit percentage does the Amazon Compute SLA commit to if availability drops below 99.0% but is at least 95.0%?"
        q['ground_truth'] = "AWS provides a 30% service credit if Monthly Uptime Percentage is less than 99.0% but equal to or greater than 95.0% (and 100% service credit if less than 95.0%)."

with open('enterprise_audit_package/datasets/golden_testset_50.json', 'w', encoding='utf-8') as f:
    json.dump(queries, f, indent=2)

print('golden_testset_50.json and entity_resolution_100.json created successfully!')
