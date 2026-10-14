import os
from typing import List, Dict
import litellm

def expand_query(query: str, language_tag: str = "mixed") -> List[str]:
    """
    Takes the original Hinglish/Code-Mixed query and returns two views:
    1. The original surface query (for lexical exact-match bias).
    2. An English-translated pivot query (for dense semantic recall).
    """
    views = [query]
    
    # If it's already English, no need to expand, or we can just return the same.
    if language_tag == "en":
        return views
        
    try:
        # Prompt to translate to English
        prompt = f"""Translate the following query into formal English. Output ONLY the translated query, without any quotes or preamble.
        
Query: {query}"""

        model_name = os.environ.get("ROUTER_MODEL", "openai/gpt-oss-20b")
        from openai import OpenAI
        groq_client = OpenAI(
            api_key=os.environ.get("GROQ_API_KEY", ""),
            base_url="https://api.groq.com/openai/v1"
        )
        response = groq_client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=256
        )
        
        translated_query = response.choices[0].message.content.strip().strip('"')
        if translated_query and translated_query.lower() != query.lower():
            views.append(translated_query)
            
    except Exception as e:
        print(f"[Multi-View] Error expanding query: {e}")
        
    return views
