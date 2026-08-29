# MLflow Concepts & Usage in RAG SaaS

This document outlines exactly how **MLflow** is integrated into our architecture for evaluating the Retrieval-Augmented Generation (RAG) pipeline. Rather than using the full, heavy MLflow suite, we have adopted a highly customized, lightweight approach optimized for speed and custom LLM judges.

---

## 🟢 What We ARE Using

### 1. MLflow Tracking (Metrics & Experiments)
We use MLflow's core tracking APIs to organize and log the final results of our evaluations.
* **`mlflow.set_experiment()`**: Groups our evaluation runs logically (e.g., `"RAG-SaaS-Automated-Evaluation-V2"`).
* **`mlflow.start_run()`**: Creates an isolated historical record every time we run our benchmark script.
* **`mlflow.log_metric()`**: Used to record our custom, manually-calculated scores (Faithfulness, Relevance, Context Accuracy) to the dashboard.

### 2. Local SQLite Backend
* **Concept**: Instead of hosting a heavy remote tracking server (like an AWS EC2 instance or Databricks cluster), we use a local file-based database.
* **Implementation**: `mlflow.set_tracking_uri("sqlite:///mlflow.db")`
* **Why?**: It allows us to view the MLflow UI (`mlflow ui`) instantly on our local machine without any infrastructure overhead, keeping the evaluation loop fast and self-contained.

### 3. "Bring Your Own" LLM-as-a-Judge
* **Concept**: Instead of relying on MLflow's built-in metric calculators (which can be inflexible or use default prompts), we wrote our own custom strict grading functions (e.g., `grade_faithfulness`, `grade_relevance`) using NVIDIA's API and Llama-3.1-70B.
* **How it works**: Our Python script handles the LLM API calls, parses the JSON responses to get a 0 or 1 score, averages those scores across the 20 benchmark questions, and *only then* hands the final numbers to MLflow. MLflow acts purely as a dumb dashboard, while our code acts as the intelligent judge.

---

## 🔴 What We INTENTIONALLY Avoided

### 1. The `mlflow.models.evaluate` API
* **What it does**: This is MLflow's official API for automatically scoring RAG pipelines and generating a massive suite of default metrics.
* **Why we removed it**: As noted in our codebase, this API hangs for 15+ minutes in our environment. Furthermore, we only care about our three hyper-specific, strict metrics. Using the official API was bloated, slow, and opaque.

### 2. Autologging (`mlflow.langchain.autolog`)
* **What it does**: Automatically hooks into LangChain/LangGraph to record every single prompt, LLM call, and token count.
* **Why we disabled it**: When running a batch evaluation of 20 complex questions through a multi-step LangGraph routing and retrieval pipeline, autologging intercepts hundreds of events. This caused massive processing delays. We disabled it in `src/main.py` to keep the API lightning fast.
