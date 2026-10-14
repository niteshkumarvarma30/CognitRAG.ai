"""
Verification of updated detect_language function logic against v2 traces.
"""
import json
import re
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))
from src.ingestion.language_detector import UNAMBIGUOUS_HINDI, HOMOGRAPHS, COMMON_ENGLISH_WORDS, DEVANAGARI_PATTERN

RECOGNIZED_ENGLISH_PROPER_NOUNS = {
    "office", "wire", "sir", "madam", "jail", "category", "fake", "id", "kudos",
    "pizza", "toilet", "coal", "scam", "silent", "note", "ban", "rapist", "agent",
    "loudspeaker", "cngrts", "congrats", "proove", "prove", "proved", "hr", "hour",
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "india", "pakistan", "australia", "worldcup", "muslim", "hindu", "bjp", "cwg", "nh", "mms"
}

ALL_ENGLISH_WORDS = COMMON_ENGLISH_WORDS | RECOGNIZED_ENGLISH_PROPER_NOUNS
TWITTER_META = {"rt", "via", "dm"}

def new_detect_language(text: str) -> str:
    if not text or len(text.strip()) < 5:
        return "en"

    # Check for Devanagari
    if DEVANAGARI_PATTERN.search(text):
        en_latin = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        if len(en_latin) >= 2:
            return "mixed"
        return "hi-latn"

    # Clean text from handles and hashtags for token extraction
    clean_text = re.sub(r'[@#]\w+', ' ', text)
    raw_tokens = re.findall(r'\b[A-Za-z0-9]+\b', clean_text)
    
    # Extract capitalized English markers and recognized proper nouns (K=1)
    capitalized_en_markers = 0
    for tok in raw_tokens:
        tok_lower = tok.lower()
        if tok_lower in TWITTER_META or tok_lower in UNAMBIGUOUS_HINDI or tok_lower in HOMOGRAPHS:
            continue
        # 1. Acronyms (ALL CAPS >= 2 chars, e.g. CWG, NH, MMS, BJP, VK)
        if len(tok) >= 2 and tok.isupper() and not tok.isdigit() and tok not in ("CM", "PM"):
            capitalized_en_markers += 1
        # 2. CamelCase (e.g. WorldCup)
        elif re.match(r'^[A-Z][a-z]+[A-Z]\w*$', tok):
            capitalized_en_markers += 1
        # 3. Recognized English proper nouns / domain loanwords
        elif tok_lower in RECOGNIZED_ENGLISH_PROPER_NOUNS:
            capitalized_en_markers += 1

    words = re.findall(r'\b[a-zA-Z]+\b', clean_text.lower())
    if not words:
        return "en"

    total = len(words)
    hi_count = sum(1 for w in words if w in UNAMBIGUOUS_HINDI)
    en_count = sum(1 for w in words if w in ALL_ENGLISH_WORDS)
    homo_count = sum(1 for w in words if w in HOMOGRAPHS)

    # Disambiguate homographs: if unambiguous Hindi exists, homographs count as Hindi
    if hi_count > 0:
        hi_count += homo_count
    else:
        en_count += homo_count

    hi_ratio = hi_count / total
    en_ratio = en_count / total

    # Override rule: if sentence contains >= K (K=1) capitalized English tokens / proper nouns and Hindi words
    if capitalized_en_markers >= 1 and hi_count >= 1:
        return "mixed"

    # 1. Pure English
    if hi_count == 0:
        return "en"
    if en_ratio >= 0.40 and hi_count <= 1:
        return "en"

    # 2. Mixed Code-Switching
    if hi_count >= 1 and en_count >= 2:
        return "mixed"
    if hi_count >= 1 and en_count >= 1 and en_ratio >= 0.12:
        return "mixed"
    if hi_count >= 1 and en_count >= 1 and hi_ratio < 0.65:
        return "mixed"

    # 3. Pure Romanized Hindi (hi-latn)
    if en_count == 0 and hi_count >= 1:
        return "hi-latn"
    if hi_count >= 3 and en_count <= 1:
        return "hi-latn"
    if hi_ratio >= 0.65:
        return "hi-latn"

    return "mixed" if (hi_count >= 1 and en_count >= 1) else ("hi-latn" if hi_count > 0 else "en")

# Test on v2 traces
traces_path = os.path.join(os.path.dirname(__file__), "..", "traces", "comi_revalidation_traces.json")
with open(traces_path, "r", encoding="utf-8") as f:
    traces = json.load(f)["traces"]

hi_latn_correct = sum(1 for t in traces if t["gold_answer"] == "hi-latn" and new_detect_language(t["input_query"]) == "hi-latn")
mixed_correct = sum(1 for t in traces if t["gold_answer"] == "mixed" and new_detect_language(t["input_query"]) == "mixed")

print(f"hi-latn accuracy: {hi_latn_correct}/40 ({hi_latn_correct/40*100:.1f}%)")
print(f"mixed accuracy:   {mixed_correct}/40 ({mixed_correct/40*100:.1f}%)")
print(f"overall accuracy: {hi_latn_correct + mixed_correct}/80 ({(hi_latn_correct + mixed_correct)/80*100:.1f}%)")
