"""
Systematic evaluation of K and English token detection on v2 traces.
"""
import json
import re
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))
from src.ingestion.language_detector import UNAMBIGUOUS_HINDI, HOMOGRAPHS, COMMON_ENGLISH_WORDS

traces_path = os.path.join(os.path.dirname(__file__), "..", "traces", "comi_revalidation_traces.json")
with open(traces_path, "r", encoding="utf-8") as f:
    traces = json.load(f)["traces"]

# Expanded English words / loanwords frequently used in code-switching
EXPANDED_ENGLISH = COMMON_ENGLISH_WORDS | {
    # Loanwords & code-switching nouns
    "office", "wire", "sir", "madam", "jail", "category", "fake", "id", "kudos",
    "pizza", "toilet", "coal", "scam", "silent", "note", "ban", "rapist", "agent",
    "loudspeaker", "cngrts", "congrats", "proove", "prove", "proved", "hr", "hour",
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "india", "pakistan", "australia", "worldcup", "muslim", "hindu", "bjp"
}

TWITTER_META = {"rt", "via", "dm"}

def extract_capitalized_and_english_tokens(text: str):
    """
    Returns list of tokens matching:
    1. Acronyms (ALL CAPS >= 2 chars, e.g. CWG, NH, MMS, BJP, VK) not in TWITTER_META
    2. CamelCase tokens (e.g. WorldCup, TripleTalaq)
    3. Recognized English loanwords / proper nouns
    4. Mid-sentence capitalized words that are NOT in UNAMBIGUOUS_HINDI or HOMOGRAPHS
    """
    clean_text = re.sub(r'@\w+', ' ', text)  # remove user handles
    # Also strip '#' from hashtags so #Toilet -> Toilet, #WorldCup -> WorldCup
    clean_text = re.sub(r'#(\w+)', r' \1 ', clean_text)
    
    tokens = re.findall(r'\b[A-Za-z0-9]+\b', clean_text)
    
    found = []
    
    for t in tokens:
        t_lower = t.lower()
        if t_lower in TWITTER_META:
            continue
            
        # 1. Recognized English word (either in expanded lexicon or common)
        if t_lower in EXPANDED_ENGLISH and t_lower not in UNAMBIGUOUS_HINDI and t_lower not in HOMOGRAPHS:
            found.append(t)
            continue
            
        # 2. All-caps acronym of length >= 2 (e.g. CWG, NH, MMS, VK, BJP)
        if len(t) >= 2 and t.isupper() and not t.isdigit():
            if t_lower not in UNAMBIGUOUS_HINDI:
                found.append(t)
                continue
                
        # 3. CamelCase (e.g. WorldCup)
        if re.match(r'^[A-Z][a-z]+[A-Z]\w*$', t):
            if t_lower not in UNAMBIGUOUS_HINDI:
                found.append(t)
                continue

    return list(dict.fromkeys(found))


print("=== EVALUATION OF MARKER TOKENS ACROSS ALL 80 V2 TRACES ===")
for K in [1, 2, 3]:
    hi_latn_correct = 0
    hi_latn_to_mixed = 0
    mixed_correct = 0
    mixed_to_hi_latn = 0
    
    for t in traces:
        gold = t["gold_answer"]
        text = t["input_query"]
        markers = extract_capitalized_and_english_tokens(text)
        
        # Current logic baseline
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        hi_count = sum(1 for w in words if w in UNAMBIGUOUS_HINDI)
        en_count = sum(1 for w in words if w in EXPANDED_ENGLISH)
        homo_count = sum(1 for w in words if w in HOMOGRAPHS)
        if hi_count > 0:
            hi_count += homo_count
        else:
            en_count += homo_count
            
        # Override rule: if markers >= K -> "mixed"
        if len(markers) >= K and hi_count >= 1:
            pred = "mixed"
        elif hi_count >= 3 and en_count <= 1:
            pred = "hi-latn"
        elif hi_count >= 1 and en_count == 0:
            pred = "hi-latn"
        elif hi_count >= 1 and en_count >= 1:
            pred = "mixed"
        else:
            pred = "hi-latn" if hi_count > 0 else "en"
            
        if gold == "hi-latn":
            if pred == "hi-latn":
                hi_latn_correct += 1
            else:
                hi_latn_to_mixed += 1
        elif gold == "mixed":
            if pred == "mixed":
                mixed_correct += 1
            else:
                mixed_to_hi_latn += 1
                
    print(f"\n--- K = {K} ---")
    print(f"  hi-latn: {hi_latn_correct}/40 ({hi_latn_correct/40*100:.1f}%) | False Mixed: {hi_latn_to_mixed}")
    print(f"  mixed:   {mixed_correct}/40 ({mixed_correct/40*100:.1f}%) | False hi-latn: {mixed_to_hi_latn}")
    print(f"  Overall: {hi_latn_correct + mixed_correct}/80 ({(hi_latn_correct + mixed_correct)/80*100:.1f}%)")
