"""
Test ignoring hashtags (#...) and handles (@...) since they are metadata 'ot' in COMI-LINGUA.
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

EXPANDED_ENGLISH = COMMON_ENGLISH_WORDS | {
    "office", "wire", "sir", "madam", "jail", "category", "fake", "id", "kudos",
    "pizza", "toilet", "coal", "scam", "silent", "note", "ban", "rapist", "agent",
    "loudspeaker", "cngrts", "congrats", "proove", "prove", "proved", "hr", "hour",
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "india", "pakistan", "australia", "worldcup", "muslim", "hindu", "bjp", "cwg", "nh", "mms"
}

TWITTER_META = {"rt", "via", "dm"}

def extract_tokens_no_hashtag(text: str):
    # Remove @handles AND #hashtags (both are 'ot' in COMI-LINGUA annotation)
    clean_text = re.sub(r'[@#]\w+', ' ', text)
    tokens = re.findall(r'\b[A-Za-z0-9]+\b', clean_text)
    
    found = []
    for t in tokens:
        t_lower = t.lower()
        if t_lower in TWITTER_META:
            continue
            
        # 1. Recognized English word / loanword
        if t_lower in EXPANDED_ENGLISH and t_lower not in UNAMBIGUOUS_HINDI and t_lower not in HOMOGRAPHS:
            found.append(t)
            continue
            
        # 2. Acronyms (ALL CAPS >= 2 chars, e.g. CWG, NH, MMS, BJP)
        # Note: 2-letter common abbreviations like CM (Chief Minister), PM might appear in pure Hindi political posts.
        # But CWG, MMS, BJP, NH are clear code-switching / acronyms.
        if len(t) >= 2 and t.isupper() and not t.isdigit():
            if t_lower not in UNAMBIGUOUS_HINDI and t not in ("CM", "PM"):
                found.append(t)
                continue
                
        # 3. CamelCase (e.g. WorldCup)
        if re.match(r'^[A-Z][a-z]+[A-Z]\w*$', t):
            if t_lower not in UNAMBIGUOUS_HINDI:
                found.append(t)
                continue

    return list(dict.fromkeys(found))

print("=== RESULTS WITH HASHTAGS EXCLUDED (Tuned Marker Extraction) ===")
for K in [1, 2]:
    hi_latn_correct = 0
    hi_latn_to_mixed = 0
    mixed_correct = 0
    mixed_to_hi_latn = 0
    
    for t in traces:
        gold = t["gold_answer"]
        text = t["input_query"]
        markers = extract_tokens_no_hashtag(text)
        
        words = re.findall(r'\b[a-zA-Z]+\b', re.sub(r'[@#]\w+', ' ', text).lower())
        hi_count = sum(1 for w in words if w in UNAMBIGUOUS_HINDI)
        en_count = sum(1 for w in words if w in EXPANDED_ENGLISH)
        homo_count = sum(1 for w in words if w in HOMOGRAPHS)
        if hi_count > 0:
            hi_count += homo_count
        else:
            en_count += homo_count
            
        # Override rule
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
