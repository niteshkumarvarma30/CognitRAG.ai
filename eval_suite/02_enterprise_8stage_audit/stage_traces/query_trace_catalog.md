# CognitRAG Enterprise Stage-by-Stage Trace Catalog

**Audit Run Date:** 2026-09-06 23:03:22  
**Sample Size:** 50 Golden Queries  
**Tenant ID:** `b8e008d0-a681-501e-af59-9af5d1b4cb71`  

| Query ID | Source | Query Preview | RRF Fused Rank | Predicted Conf | Actual Y | Squared Error |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| `real_jira_1` | jira | "What was the root cause of the shuffle deadlock in Jira tick..." | Rank #19 | 0.80 | 0.0 | `0.64000` |
| `real_jira_2` | jira | "What configuration change was recommended in Jira KAFKA-1420..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_jira_3` | jira | "Which memory limit in cgroup v2 caused the OOM kills in Jira..." | Rank #3 | 0.80 | 0.0 | `0.64000` |
| `real_jira_4` | jira | "What buffer overflow size caused the HTTP 502 Bad Gateway in..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_jira_5` | jira | "What race condition occurred in Jira BILL-301 regarding paym..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_jira_6` | jira | "What was the failure in Jira BILL-302 concerning automated c..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_jira_7` | jira | "What security standard was implemented for mobile authentica..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_jira_8` | jira | "Why did mTLS certificate auto-renewal fail in Jira AUTH-502?..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_jira_9` | jira | "What caused the Calico CNI IP leak issue in Jira K8S-11802?..." | Rank #2 | 0.80 | 0.0 | `0.64000` |
| `real_jira_10` | jira | "What was the Snowflake cost spike issue reported in Jira INF..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_github_11` | github | "What parameters were modified in Nginx configuration in PR #..." | Rank #2 | 0.80 | 0.0 | `0.64000` |
| `real_github_12` | github | "How did PR #1195 fix the Calico IPAM leak on worker nodes?..." | Rank #4 | 0.80 | 0.0 | `0.64000` |
| `real_github_13` | github | "What async architecture was introduced in PR #1206 for Conta..." | Rank #2 | 0.80 | 0.0 | `0.64000` |
| `real_github_14` | github | "What fencing mechanism did PR #1385 implement for Kafka prod..." | Rank #2 | 0.80 | 0.0 | `0.64000` |
| `real_github_15` | github | "What jitter calculation was added in PR #1421 to prevent Kaf..." | Rank #4 | 0.80 | 0.0 | `0.64000` |
| `real_github_16` | github | "What quorum timeout change was made in PR #1503 for Kafka KR..." | Rank #2 | 0.80 | 0.0 | `0.64000` |
| `real_github_17` | github | "What Stripe webhook signature check was hardened in PR #3011..." | Rank #4 | 0.80 | 0.0 | `0.64000` |
| `real_github_18` | github | "What caching strategy was implemented in PR #3022 for TaxJar..." | Rank #4 | 0.80 | 0.0 | `0.64000` |
| `real_github_19` | github | "What Keycloak SAML rollover procedure was automated in PR #4..." | Rank #4 | 0.80 | 0.0 | `0.64000` |
| `real_github_20` | github | "How did PR #4512 resolve the Spark shuffle deadlock?..." | Rank #5 | 0.80 | 0.0 | `0.64000` |
| `real_slack_21` | slack | "What immediate mitigation was agreed in the #incident-spark-..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_slack_22` | slack | "What was the consumer lag reported by on-call engineers in #..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_slack_23` | slack | "What did the SRE team report during #incident-calico-ip-leak..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_slack_24` | slack | "What action was taken in #incident-snowflake-cost-spike to c..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_slack_25` | slack | "What resolution was confirmed in #incident-stripe-webhook-ou..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_slack_26` | slack | "What was discussed in #compliance-soc2-readiness regarding e..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_slack_27` | slack | "What priority issue was escalated in #customer-incident-p1?..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_slack_28` | slack | "What was the decision in #core-auth-team about session cooki..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_slack_29` | slack | "What upgrade was reviewed in #platform-k8s-upgrades for prod..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_slack_30` | slack | "What was the primary topic during #sre-weekly-review?..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_notion_31` | notion | "What consensus mechanism is specified in RFC-101 for distrib..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_notion_32` | notion | "What is the migration strategy to Apache Kafka KRaft mode ou..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_notion_33` | notion | "What workload identity framework is mandated in RFC-103?..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_notion_34` | notion | "What idempotency window does RFC-104 establish for event-dri..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_notion_35` | notion | "What are the RPO and RTO targets in RFC-105 for multi-region..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_notion_36` | notion | "What HNSW indexing parameters are specified in RFC-106 for p..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_notion_37` | notion | "What deletion timeline is mandated in RFC-107 for GDPR Right..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_notion_38` | notion | "What storage engine is proposed in RFC-108 for high-throughp..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_notion_39` | notion | "What standard protocol is defined in RFC-109 for service-to-..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_notion_40` | notion | "What backup retention schedule is defined in RFC-110 for Tie..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_sec_41` | sec_edgar | "What was Microsoft's effective tax rate for fiscal year 2024..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_sec_42` | sec_edgar | "What was the total provision for income taxes and the foreig..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_sec_43` | sec_edgar | "How much total cash, cash equivalents, and short-term invest..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_sec_44` | sec_edgar | "What service credit percentage does the Amazon Compute SLA c..." | Rank #1 | 0.95 | 1.0 | `0.00250` |
| `real_sec_45` | sec_edgar | "What vulnerability scanning frequency and key management con..." | Rank #10 | 0.80 | 0.0 | `0.64000` |
| `real_negative_46` | out_of_scope | "Who won the 2024 ICC T20 Cricket World Cup?..." | Rank #Refusal | 0.05 | 0.0 | `0.00250` |
| `real_negative_47` | out_of_scope | "What is the authentic recipe and hydration ratio for Neapoli..." | Rank #Refusal | 0.05 | 0.0 | `0.00250` |
| `real_negative_48` | out_of_scope | "What was the exact stock closing price of Apple on September..." | Rank #Refusal | 0.05 | 0.0 | `0.00250` |
| `real_negative_49` | out_of_scope | "How do you construct a parameterized quantum circuit using P..." | Rank #Refusal | 0.05 | 0.0 | `0.00250` |
| `real_negative_50` | out_of_scope | "What are the complete original lyrics to Bohemian Rhapsody b..." | Rank #Refusal | 0.05 | 0.0 | `0.00250` |

**Mean Brier Score across 50 queries:** `0.1810`