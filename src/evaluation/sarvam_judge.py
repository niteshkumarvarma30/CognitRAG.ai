import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

def call_sarvam_judge(prompt: str) -> int:
    """Calls the GitHub Models API (gpt-4o) with a strict grading prompt and returns 1 or 0."""
    api_key = os.getenv("GITHUB_TOKEN")
    if not api_key:
        print("No GitHub Token found")
        return 0
        
    url = "https://models.inference.ai.azure.com/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": "You are a strict, impartial AI judge. Your ONLY allowed output is the single character '1' or the single character '0'. No explanations, no other text."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.0,
        "max_tokens": 10
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        if response.status_code == 200:
            data = response.json()
            content = data.get("choices", [])[0].get("message", {}).get("content", "").strip()
            
            # The model should output "1" or "0". We parse the first character.
            if content and content[0] in ["0", "1"]:
                return int(content[0])
            else:
                # Fallback extraction if model outputs "The grade is 1"
                if "1" in content and "0" not in content: return 1
                if "0" in content and "1" not in content: return 0
                return 0
        else:
            print(f"Judge API failed with status {response.status_code}: {response.text}")
            return 0
    except Exception as e:
        print(f"Judge request error: {str(e)}")
        return 0

def grade_faithfulness(question: str, context: str, answer: str) -> int:
    """
    Checks if the answer is faithful to the retrieved context (no hallucinations).
    Returns 1 if faithful, 0 if it contains hallucinated facts not in context.
    """
    if not context or not answer:
        # If it says 'I don't know' when there's no context, that's faithful!
        if "I don't know" in answer or "I do not know" in answer:
            return 1
        return 0
        
    # Truncate context to ~2500 tokens to avoid 413 Payload Too Large and 40k TPM rate limits
    context = context[:10000]
    
    prompt = f"""
Given the following CONTEXT and the generated ANSWER to a user QUESTION, determine if the ANSWER is faithful to the CONTEXT.
An answer is faithful if all of its factual claims are directly supported by or logically derived from the CONTEXT.
It is NOT faithful if it introduces new factual information not present in the CONTEXT.

CONTEXT:
{context}

ANSWER:
{answer}

Is the answer completely faithful to the context?
Output '1' if YES. Output '0' if NO.
"""
    return call_sarvam_judge(prompt)

def grade_relevance(question: str, answer: str) -> int:
    """
    Checks if the answer directly addresses the user's question.
    Returns 1 if relevant, 0 if irrelevant.
    """
    prompt = f"""You are a strict evaluator. Given a question and an answer, evaluate whether the answer is relevant and addresses the question.
If the answer is relevant, output ONLY the number 1. If it is entirely irrelevant or says "I don't know", output ONLY the number 0.

Question: {question}
Answer: {answer}
"""
    return call_sarvam_judge(prompt)

def grade_context_accuracy(question: str, expected_answer: str, context: str) -> int:
    """
    Checks if the retrieved context contains the necessary information to answer the question,
    compared against the ground-truth expected answer.
    Returns 1 if the context is accurate and sufficient, 0 otherwise.
    """
    if not context or not expected_answer:
        return 0
        
    # Truncate context to ~2500 tokens to avoid 413 Payload Too Large and 40k TPM rate limits
    context = context[:10000]
    prompt = f"""
Given the following user QUESTION, the ground-truth EXPECTED_ANSWER, and the retrieved CONTEXT, 
determine if the CONTEXT contains enough accurate and relevant information to derive the EXPECTED_ANSWER.

QUESTION:
{question}

EXPECTED_ANSWER:
{expected_answer}

CONTEXT:
{context}

Does the context contain the correct information to answer the question?
Output '1' if YES. Output '0' if NO.
"""
    return call_sarvam_judge(prompt)
