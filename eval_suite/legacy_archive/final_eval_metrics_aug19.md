Based on the Comprehensive Evaluation Report, our team went through a fascinating journey of architectural experimentation to fix poor Context Accuracy and Strict Faithfulness scores.

Here is exactly what we changed in the architecture during the evaluations, and how those changes impacted our metrics:

### 1. The Baseline (v1.0)
Initially, we used a standard Vector + Keyword pipeline against 20 complex SEC financial queries.

* **Architecture:** Standard dual retrieval with basic embeddings.
* **Metrics:**
  * General Faithfulness (Llama-3): 95%
  * Strict Faithfulness (Nemotron): 55%
  * Context Accuracy: 60%
* **The Problem:** The retriever was struggling to find dense mathematical chunks (only 60% accurate), and the LLM was heavily penalized by the strict judge for synthesizing/hallucinating answers instead of strictly quoting facts.

### 2. Failed Experiment 1: RRF Weight Inversion (v2.0)
* **What we changed in the architecture:** We altered the Reciprocal Rank Fusion (RRF) algorithm to heavily favor BM25 Keyword Search (weight 2.5) over Vector Semantic Search (weight 1.5). We hoped this would find specific mathematical terms better.
* **Did metrics improve?:** NO. It was a catastrophic failure. Context Accuracy plummeted from 60% down to 5-30%.
* **Why?** Keyword search pulled up thousands of irrelevant chunks just because they contained generic financial terms like "2022" or "value", burying the mathematically correct chunks. We learned that Vector Semantic weight MUST remain higher than Keyword weight.

### 3. Failed Experiment 2: Adding HyDE (v3.0)
* **What we changed in the architecture:** We implemented HyDE (Hypothetical Document Embeddings), where the generator LLM guesses a hypothetical answer to the user's question, and we embed that guess to search the vector database.
* **Did metrics improve?:** NO. Context Accuracy dropped even further to 10-15%.
* **Why?** The LLM hallucinated dates and terminology when guessing financial answers. This actively "poisoned" the vector search, driving it away from the correct documents. We permanently removed HyDE.

### 4. The Final Optimization (v4.0 Checkpoint)
* **What we changed in the architecture:** We completely reverted the failed HyDE and RRF experiments. Instead, we:
  * Upgraded to a domain-specific NVIDIA Embeddings model.
  * Moved to Decoupled Storage (Parent-Child Chunking): We embed tiny 400-character chunks (for hyper-precise vector matching) but return massive 2,000-character parent chunks to the LLM to provide maximum context.
* **Did metrics improve?:** YES.
  * Faithfulness: Hit a perfect 100.0% (0 hallucinations).
  * Context Accuracy: Improved from 60% to 80.0%.
  * Answer Relevance (Sarvam Judge): Reached 100.0%.

### Conclusion
By reverting "clever" AI tricks like HyDE and Keyword-bias, and instead relying on Parent-Child Chunking and better embedding models, we successfully locked down our Faithfulness score at 100% and drastically improved Context Accuracy!
