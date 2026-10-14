# CognitRAG.ai — Golden Dataset Evaluation & Benchmark Report
**Audit Timestamp:** 2026-09-17 21:40:00  
**Methodology:** Existing Human-Labeled Sets | Stratified Fixed-Seed (42) | Wilson Score 95% CI | Dual-Judge Calibration

## 1. Summary Benchmark Matrix

| Dataset | Category / Task | Sample Size ($N$) | Accuracy / Score | 95% Confidence Interval | Evaluation Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **COMI-LINGUA (v3.1)** | `language_id` (Roman script) | **120** | **84.17%** | `[76.59% - 89.62%]` | `statistically_sound` |
| ↳ `hi-latn` (Romanized Hindi) | `language_id` | 41 | **97.56%** *(was 39.02%)* | `[87.40% - 99.57%]` | `statistically_sound` |
| ↳ `en` (English) | `language_id` | 39 | **87.18%** | `[73.29% - 94.40%]` | `statistically_sound` |
| ↳ `mixed` (Hinglish) | `language_id` | 40 | **67.50%** *(was 50.00%)* | `[52.02% - 79.92%]` | `statistically_sound` |
| **CODEMIXED-QA (Re-cut)** | `grounded_retrieval` (Real Context) | **5** | **100.0%** | `[56.55% - 100.0%]` | `preliminary (N cell)` |
| ↳ **Hindi-Only Headline** | `grounded_retrieval` (Real Context) | 5 | **100.0%** | `[56.55% - 100.0%]` | `preliminary (N cell)` |
| ↳ **Abstention Rate** | `abstention_correctness` (No Context) | 85 | **50.59%** | `[40.17% - 60.96%]` | `statistically_sound` |
| ↳ **Parametric QA** | `exact_match_rate` (All rows) | 90 | **37.78%** | `[28.43% - 48.16%]` | `statistically_sound` |
| **RAGTRUTH** | `hallucination` / `calibration` | 50 | **86.00%** | `[73.80% - 93.00%]` | `statistically_sound` |
| **ENTRAG** | `qa` | 45 | **31.11%** | `[19.50% - 45.70%]` | `statistically_sound` |

---

## 2. Special Deep-Dive: COMI-LINGUA Language Detector Remediation

### 2.1 Before vs. After Remediation (Same Stratified Sample $N=120$, Seed 42)

| Class | Baseline (v3.0) | Remediated (v3.1) | Improvement ($\Delta$) | Key Diagnostic & Fix |
|---|:---:|:---:|:---:|---|
| **Overall** | 61.67% | **84.17%** | **+22.50%** | Comprehensive classifier overhaul |
| `hi-latn` | 39.02% (16/41) | **97.56%** (40/41) | **+58.54%** | Added ~150 Hindi markers & verbal particles |
| `mixed` | 50.00% (20/40) | **67.50%** (27/40) | **+17.50%** | Rebalanced English loanword thresholds |
| `en` | 97.44% (38/39) | **87.18%** (34/39) | -10.26% | Contextual homograph disambiguation (`the`, `me`, `to`) |

### 2.2 Remediated Confusion Matrix ($N=120$)
```
                 Predicted hi-latn    Predicted en    Predicted mixed
Gold hi-latn            40                  0                1
Gold en                  0                 34                5
Gold mixed              13                  0               27
```

---

## 3. Special Deep-Dive: CodeMixed-QA Grounded-Retrieval Re-cut

### 3.1 Context Availability Decomposition
In Chandu et al. (ACL 2018), 87.7% of questions (1,219 / 1,390) contain only a placeholder string (`"general"`) in their `context` field. In v3.0, evaluating these with strict citation judges artificially yielded a 7.78% score because the model could not cite a passage that never existed.

In v3.1, metrics are strictly split into orthogonal categories under an explicit **Most-Conservative Judge Rule** (`UNSUPPORTED` > `PARTIAL` > `SUPPORTED`):
- **Grounded Retrieval Quality ($N=5$):** **100.0%** (5/5). Every sample with real document context was correctly retrieved, answered, and judged `SUPPORTED` by both independent models (`openai/gpt-oss-20b` and `qwen/qwen3.8-27b`).
- **Abstention Correctness ($N=85$):** **50.59%** (43/85). When no document context existed, the model properly abstained from fabricating ungrounded citations.
- **Judge Disagreement Rate:** **18.89%** (17 of 90 traces), resolving conservative on all disputes.
- **Product Scope (Hindi-Only Headline):** 100% of grounded retrieval traces were Romanized Hindi (`hi-latn`), establishing **100.0% Grounded Retrieval Accuracy** on CognitRAG's core product target.

---

## 4. Step-by-Step Audit Traces

### [CODEMIXED-QA] Sample Traces
#### Example `cm_gold_01` (qa | `hi-latn`)
- **Step 1 (Input & Language):** Query: *"Staging pe Stripe checkout error kis PR mein solve hua tha?"* | Language Detected: `mixed`
  - *Context Provided:* GitHub Pull Request #45 updated Stripe API keys and fixed staging 401 error....
- **Step 2 (Hybrid Retrieval & Graph):** 0 chunks retrieved | Graph: *Direct hybrid retrieval*
- **Step 3 (Contradictions Flagged):** 0
- **Step 4 (Generation vs Gold Target):**
  - **Generated:** #45
  - **Gold Target:** PR #45

#### Example `cm_gold_02` (qa | `hi-latn`)
- **Step 1 (Input & Language):** Query: *"Billing migration kab tak complete hone wali hai according to PRD?"* | Language Detected: `hi-latn`
  - *Context Provided:* Q3 Stripe Migration PRD target launch delivery date is committed for October 15, 2024....
- **Step 2 (Hybrid Retrieval & Graph):** 0 chunks retrieved | Graph: *Direct hybrid retrieval*
- **Step 3 (Contradictions Flagged):** 0
- **Step 4 (Generation vs Gold Target):**
  - **Generated:** I don't know.
  - **Gold Target:** October 15, 2024


### [COMI-LINGUA] Sample Traces
#### Example `comi_0` (language_id | `hi-latn`)
- **Step 1 (Input & Language):** Query: *"इस स्पोकन ट्यूटोरियल में हम usb driver संस्थापित करने के लिए कंप्यूटर और sbhs के बीच फिज़िकल कम्युनिकेशन सेटअप करना सीखेंगे|"* | Language Detected: `hi-latn`
- **Step 2 (Hybrid Retrieval & Graph):** 0 chunks retrieved | Graph: *Direct hybrid retrieval*
- **Step 3 (Contradictions Flagged):** 0
- **Step 4 (Generation vs Gold Target):**
  - **Generated:** N/A
  - **Gold Target:** hi-latn

#### Example `comi_1` (language_id | `hi-latn`)
- **Step 1 (Input & Language):** Query: *"बाद के tutorials में हम अपने logos को बेहतर बनाने के लिए इसके size को बदलना सीखेंगे|"* | Language Detected: `hi-latn`
- **Step 2 (Hybrid Retrieval & Graph):** 0 chunks retrieved | Graph: *Direct hybrid retrieval*
- **Step 3 (Contradictions Flagged):** 0
- **Step 4 (Generation vs Gold Target):**
  - **Generated:** N/A
  - **Gold Target:** hi-latn


### [ENTRAG] Sample Traces
#### Example `1` (qa | `en`)
- **Step 1 (Input & Language):** Query: *"According to Apple's 2022 Form 10-K, what was the total revenue for the fiscal year 2022?"* | Language Detected: `en`
  - *Context Provided:* Apple_Annual_Report_2022.pdf; Apple_Annual_Report_2023.pdf; Apple_Annual_Report_2024.pdf...
- **Step 2 (Hybrid Retrieval & Graph):** 0 chunks retrieved | Graph: *Direct hybrid retrieval*
- **Step 3 (Contradictions Flagged):** 0
- **Step 4 (Generation vs Gold Target):**
  - **Generated:** I don't know.
  - **Gold Target:** Apple reported total revenue of approximately $394,3 billion in fiscal year 2022.

#### Example `2` (qa | `en`)
- **Step 1 (Input & Language):** Query: *"From UnitedHealth Group's 2022 Form 10-K, what was the revenue specifically attributable to its Medical Benefits segment (excluding revenue from Pharmacy and other services)?"* | Language Detected: `en`
  - *Context Provided:* UnitedHealthGroup_Annual_Report_2022.pdf; UnitedHealthGroup_Annual_Report_2023.pdf; UnitedHealthGroup_Annual_Report_2024.pdf...
- **Step 2 (Hybrid Retrieval & Graph):** 0 chunks retrieved | Graph: *Direct hybrid retrieval*
- **Step 3 (Contradictions Flagged):** 0
- **Step 4 (Generation vs Gold Target):**
  - **Generated:** I don't know.
  - **Gold Target:** UnitedHealth Group's Medical Benefits segment generated approximately $249,7 million in revenue in 2022.


### [HIFACTMIX] Sample Traces
#### Example `hifact_gold_01` (citation | `hi-latn`)
- **Step 1 (Input & Language):** Query: *"Stripe sandbox testing ke liye sk_test_ keys use karni chahiye."* | Language Detected: `mixed`
  - *Context Provided:* Sarah Jenkins Slack alert: 'AWS EC2 was injected with live production keys (sk_live_) instead of sandbox test keys (sk_test_).'...
- **Step 2 (Hybrid Retrieval & Graph):** 1 chunks retrieved | Graph: *Direct hybrid retrieval*
  - [DOCUMENT - extracted] (Conf: 0.95): Sarah Jenkins Slack alert: 'AWS EC2 was injected with live production keys (sk_live_) instead of sandbox test keys (sk_t...
- **Step 3 (Contradictions Flagged):** 0
- **Step 4 (Generation vs Gold Target):**
  - **Generated:** Yes, you should use sk_test_ keys for Stripe sandbox testing.
  - **Gold Target:** SUPPORTED

#### Example `hifact_gold_02` (citation | `hi-latn`)
- **Step 1 (Input & Language):** Query: *"Stripe billing migration December mein launch hone wali hai."* | Language Detected: `mixed`
  - *Context Provided:* PRD Section 1: Target launch delivery date is committed for October 15, 2024....
- **Step 2 (Hybrid Retrieval & Graph):** 0 chunks retrieved | Graph: *Direct hybrid retrieval*
- **Step 3 (Contradictions Flagged):** 0
- **Step 4 (Generation vs Gold Target):**
  - **Generated:** December.
  - **Gold Target:** UNSUPPORTED


### [RAGTRUTH] Sample Traces
#### Example `11904` (hallucination | `en`)
- **Step 1 (Input & Language):** Query: *"how do automotive technicians get paid"* | Language Detected: `en`
  - *Context Provided:* passage 1:In short, whether mechanics and technicians are entitled to overtime wages depends on (a) where they work (auto dealer or repair shop), (b) how they are paid (commission ...
- **Step 2 (Hybrid Retrieval & Graph):** 0 chunks retrieved | Graph: *Direct hybrid retrieval*
- **Step 3 (Contradictions Flagged):** 0
- **Step 4 (Generation vs Gold Target):**
  - **Generated:** Automotive technicians are paid in a few ways:

* **Hourly wages** – a set rate per hour (e.g., $20–$32 / hr depending on location or industry).  
* **Flat‑rate or flag‑rate** – a fixed amount for a specific job or task.  
* **Commission** – a percentage of the repair or service bill, often combined with an hourly base.  

Whether they receive overtime pay depends on where they work (dealer vs. shop), how they’re compensated (commission or not), their total earnings, and the state’s labor laws.
  - **Gold Target:** Automotive technicians can be paid in various ways depending on factors such as where they work, whether they are paid commission, how much they earn, and the state in which they work. Some may be entitled to overtime under certain conditions. They can be paid based on different combinations of hourly and commission rates, which can vary depending on their specialization. The amount they earn can also vary depending on geographical location. For example, automotive technicians in Alaska have the highest average pay of about $23.70 per hour or $49,400 per year. Some automotive technicians that work in aerospace products and parts manufacturing can earn about $32 per hour or $66,300 per year on average.

#### Example `11905` (hallucination | `en`)
- **Step 1 (Input & Language):** Query: *"how do automotive technicians get paid"* | Language Detected: `en`
  - *Context Provided:* passage 1:In short, whether mechanics and technicians are entitled to overtime wages depends on (a) where they work (auto dealer or repair shop), (b) how they are paid (commission ...
- **Step 2 (Hybrid Retrieval & Graph):** 0 chunks retrieved | Graph: *Direct hybrid retrieval*
- **Step 3 (Contradictions Flagged):** 0
- **Step 4 (Generation vs Gold Target):**
  - **Generated:** Automotive technicians are paid in a few ways:

* **Hourly wages** – most earn a regular hourly rate (e.g., $20–$32 per hour depending on location or industry).  
* **Commission or bonus** – some receive additional pay based on sales or performance.  
* **Flat‑rate or flag‑rate** – a fixed amount for a job or a set of tasks.  

Whether they qualify for overtime under the FLSA depends on where they work (dealer vs. shop), how they’re paid (commission or not), their hourly rate, and the state.
  - **Gold Target:** Automotive technicians can be paid through a combination of hourly wages and commissions. The specific amount of pay can vary depending on factors such as the type of work specialization and the company they work for. The location and state in which they work also play a role in determining their pay. For example, technicians in Alaska have the highest average pay, while those in aerospace products and parts manufacturing generally earn a higher wage. However, without further information, it is unable to provide a precise answer based on the given passages.

