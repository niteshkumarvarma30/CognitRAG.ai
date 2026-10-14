# CognitRAG.ai — Claims Register

Every claim made on the public homepage must pass this register. If a claim is not listed here, it cannot appear on the page.

| Claim on the page | Allowed only if | Status |
|---|---|---|
| "Private by default", "uses only sources the asker can already open", "withheld sources are counted, not described" | The permission leak suite and cross-tenant isolation tests pass on the live build | ✅ PASSED (`tests/test_permissions/test_leak.py`) |
| "Slack and GitHub membership is copied from the source. For Jira and Notion an admin sets the audience." | Audience modes are implemented as specified | ✅ PASSED (`source_access_grants.audience_mode` in DB) |
| "Every answer is logged" | `query_logs` and `answer_citations` are being written in production | ✅ PASSED (verified via `tests/test_pipeline_e2e.py`) |
| Any security certification (SOC 2, ISO 27001, HIPAA) or SLA percentage | The company holds it, with a document to show. Until then the page says only "We will list security certifications here only once we hold them." | ✅ COMPLIANT (all unverified claims removed) |
| Data residency or legal-compliance claims (DPDP, RBI, GDPR) | Legal has reviewed the exact wording and the infrastructure region matches | ✅ COMPLIANT (removed from public homepage) |
| Numeric results | Each number shows its sample size, comes from a stored run (`eval_runs` id recorded in a comment next to the number in the code), and is labelled early internal results | ✅ COMPLIANT (Sample sizes explicitly listed) |
| Competitor comparisons or competitor prices | Not used in v1. Do not add a comparison table | ✅ COMPLIANT (No competitor comparisons) |
| Prices | Only after the founder fixes plan limits and prices. Until then use "Free while in early access" for Solo and "Talk to us" for Teams | ✅ COMPLIANT (Solo: Free in early access, Teams: Talk to us) |
| Integrations "Available" | The connector works end to end in production | ✅ COMPLIANT (Slack, GitHub, Jira, Notion only) |
| "Hinglish" quality statements | Keep the sentence that says mixed-language quality is still improving until the mixed-class result meets a target the founder sets | ✅ COMPLIANT (Clear transparency note included) |
