"""
Tune K and Evaluate Override Rule on all 80 v2 Traces
"""
import json
import re
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from src.ingestion.language_detector import UNAMBIGUOUS_HINDI, COMMON_ENGLISH_WORDS, HOMOGRAPHS, DEVANAGARI_PATTERN


traces_path = os.path.join(os.path.dirname(__file__), "..", "traces", "comi_revalidation_traces.json")
with open(traces_path, "r", encoding="utf-8") as f:
    traces = json.load(f)["traces"]

# Expanded recognized English vocabulary from domain / code-switching
RECOGNIZED_ENGLISH_PROPER_NOUNS = {
    # Days & Time
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december",
    "hour", "hr", "hrs", "minute", "min", "sec",
    # Places & Proper Nouns
    "india", "pakistan", "australia", "delhi", "mumbai", "kashmir", "america", "china", "london", "bjp", "congress", "aap",
    # Modern & Colloquial Code-Mixed Nouns / Verbs
    "pizza", "office", "wire", "sir", "madam", "jail", "category", "fake", "id", "kudos",
    "scam", "silent", "note", "ban", "toilet", "rapist", "muslim", "hindu", "agent",
    "cngrts", "congrats", "congratulations", "proove", "prove", "proved", "loudspeaker",
    "coal", "scam", "adarsh", "cwg", "mms", "nh"
}

def get_english_marker_tokens(text: str) -> list[str]:
    """
    Find capitalized English tokens and recognized English proper nouns in text.
    Returns list of matching tokens.
    """
    markers = []
    
    # 1. Clean out twitter @handles (they are user mentions, not language tokens)
    clean_text = re.sub(r'@\w+', ' ', text)
    
    # 2. Extract hashtags words (e.g. #TripleTalaq -> TripleTalaq)
    # Check camel case in hashtags or words
    camel_matches = re.findall(r'\b[A-Z][a-z]+[A-Z]\w*\b', clean_text)
    for c in camel_matches:
        if c.lower() not in UNAMBIGUOUS_HINDI:
            markers.append(c)

    # 3. All-caps acronyms (length >= 2, e.g. CWG, NH, MMS, BJP, VK, PM, 2G)
    # Exclude common romanized Hindi screaming words if any
    acronyms = re.findall(r'\b[A-Z]{2,}\b', clean_text)
    for a in acronyms:
        if a.lower() not in UNAMBIGUOUS_HINDI:
            markers.append(a)

    # 4. Mid-sentence capitalized words: [A-Z][a-z]+ not at sentence start and not in UNAMBIGUOUS_HINDI
    words_with_pos = list(re.finditer(r'\b[A-Za-z]+\b', clean_text))
    for m in words_with_pos:
        w = m.group()
        start = m.start()
        if w[0].isupper() and len(w) > 1 and not w.isupper():
            # Check sentence boundary
            prefix = clean_text[:start].rstrip()
            is_sentence_start = (len(prefix) == 0) or (prefix[-1] in '.!?\n')
            if not is_sentence_start:
                # If it is not a Hindi word (like 'Denge', 'Haan', 'Kaha', 'Bhi', 'Nahi')
                if w.lower() not in UNAMBIGUOUS_HINDI and w.lower() not in HOMOGRAPHS:
                    markers.append(w)

    # 5. Check recognized English proper nouns & expanded loanwords (case-insensitive)
    lower_words = re.findall(r'\b[a-z0-9]+\b', clean_text.lower())
    for w in lower_words:
        if w in RECOGNIZED_ENGLISH_PROPER_NOUNS and w not in markers:
            markers.append(w)
            
    # Deduplicate while preserving order
    unique_markers = list(dict.fromkeys(markers))
    return unique_markers

print("\nTesting marker extraction on the 40 gold hi-latn traces:")
false_positives = []
for t in traces:
    if t.get("gold_answer") == "hi-latn":
        m = get_english_marker_tokens(t["input_query"])
        if len(m) > 0:
            false_positives.append((t["example_id"], len(m), m, t["input_query"]))

print(f"Total gold hi-latn with markers > 0: {len(false_positives)} / 40")
for fp in false_positives:
    print(f"[{fp[0]}] Count={fp[1]} | Markers={fp[2]} | Text: \"{fp[3][:60]}...\"")

