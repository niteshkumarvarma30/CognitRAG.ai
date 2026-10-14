"""
CognitRAG v2 — Language Detector
Tags each text unit as 'en', 'hi-latn', or 'mixed'.
Handles Romanized Hindi (Hinglish) — the key differentiator.
"""
import re
from typing import Optional

# Comprehensive high-frequency Romanized Hindi lexicon
UNAMBIGUOUS_HINDI = {
    # Postpositions & Prepositions
    "ka", "ki", "ke", "ko", "se", "mein", "pe", "par", "tak", "liye", "bina", "saath", "andar", "baahar",
    # Pronouns & Demonstratives
    "yeh", "ye", "woh", "wo", "main", "mai", "hum", "humne", "hamara", "hamari", "hamare",
    "tum", "tumhe", "tumhara", "tumhari", "tumhare", "aap", "aapne", "aapka", "aapki", "aapke",
    "unka", "unki", "unke", "unhone", "unhe", "inka", "inki", "inke", "inhone", "inhe",
    "mera", "meri", "mere", "mujhe", "mujhse", "tera", "teri", "tere", "tujhe", "apna", "apni", "apne",
    "kisi", "kisko", "kise", "kuch", "koi", "sab", "sabka", "sabke", "kaunsa", "kaunse", "kaunsi",
    # Conjunctions & Particles
    "aur", "ya", "lekin", "magar", "bhi", "toh", "kyunki", "isliye", "warna", "wrna",
    # Auxiliaries & Copulas
    "hai", "hain", "ho", "hoon", "hun", "tha", "thi", "hoga", "hogi", "honge", "thay",
    # Verbs & Aspects
    "kar", "karo", "karna", "karein", "karoge", "karunga", "kiya", "kiye", "karenge", "karta", "karti", "karte",
    "raha", "rahe", "rahi", "gaya", "gaye", "gayi",
    "aaya", "aaye", "aayi", "aao", "aja", "aana", "aate", "aati",
    "dekh", "dekho", "dekha", "dekhte", "dekhne", "dekhi",
    "bata", "batao", "bataya", "suno", "suna", "sunte",
    "chahiye", "chahta", "chahti", "chahte",
    "hota", "hoti", "hote", "hona", "hone",
    "deta", "dete", "deti", "dena", "diya", "diye", "de", "dunga", "denge",
    "chale", "chalo", "chal", "chalta", "chalti", "chalte", "chlana",
    "milega", "milegi", "milte", "mila", "mili", "milna",
    "khatam", "baat", "pata", "samajh", "samjha", "samjhe", "samjhao",
    "jao", "jaate", "jaata", "jaati", "jaana", "jaakar", "jaaye",
    "bhejo", "bhej", "bheja", "lagta", "lagti", "laga", "lage", "lagi",
    "socha", "bole", "bola", "boli", "bolte", "bol", "bolo",
    "khana", "khaana", "khaye", "pikar", "jeete", "marte", "pukaarte",
    "ruk", "jhuk", "tod", "ditta", "khareed", "lauta", "rakho", "rakiye",
    # Adverbs, Adjectives & Colloquial Words
    "yaar", "bhai", "arre", "arey", "acha", "achha", "achche", "achchi", "accha",
    "bahut", "bohot", "thoda", "thodi", "zyada", "jyada", "kam",
    "kal", "aaj", "abhi", "baad", "pehle", "kabhi", "jab", "tab", "ab",
    "yahan", "wahan", "kahan", "kahaan", "jahan",
    "kaise", "kaisa", "kaisi", "kyun", "kya", "kab", "kaun",
    "haan", "nahi", "nai", "sahi", "galat", "thik", "theek", "magar",
    "sirf", "matlab", "shuru", "bandh", "asli", "pyaar", "din", "saal", "waqt",
    "wala", "wale", "wali", "walo", "naam", "ghar", "desh", "kaam", "log", "baatein",
    "khush", "swasth", "majbut", "baccha", "mudda", "duniya", "haad", "botal",
    "palon", "yaadein", "chehra", "nazar", "zameen", "aasman", "gadi", "aaram",
    "ladkiyon", "tarah", "dhoka", "phle", "guddu", "ise", "bhookha", "maaf",
    "bina", "lauta", "poori", "bachi", "chappar", "phaad", "kamaal"
}

# Homographs between Hindi and English (disambiguated by presence of unambiguous Hindi tokens)
HOMOGRAPHS = {"me", "to", "the", "us", "is", "or", "so", "be", "an", "mat", "no", "in"}

COMMON_ENGLISH_WORDS = {
    # Core function words (excluding homographs)
    "of", "and", "a", "that", "have", "i", "it", "for", "not", "on", "with",
    "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her",
    "she", "will", "my", "one", "all", "would", "there", "their", "what", "up",
    "out", "if", "about", "who", "get", "which", "go", "when", "make", "can", "like", "time",
    "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could",
    "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think",
    "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even",
    "new", "want", "because", "any", "these", "give", "day", "most", "are", "was", "were",
    "has", "had", "been", "am", "more", "very", "please", "should", "school", "really", "going", "night",
    # Common nouns & modern verbs in code-switching
    "twitter", "tweet", "promote", "facebook", "post", "video", "youtube", "google", "online", "link",
    "local", "bus", "train", "car", "flight", "ticket", "hotel", "travel", "city",
    "oil", "food", "water", "place", "service", "system", "support", "help",
    "pollution", "level", "control", "air", "health", "problem", "issue", "traffic",
    "network", "mobile", "phone", "sim", "recharge", "call", "message", "chat",
    "against", "justice", "court", "order", "rules", "law", "police", "case",
    "verdict", "decision", "report", "news", "update", "paper",
    "university", "college", "student", "teacher", "exam", "result", "class", "course",
    "minister", "president", "election", "vote", "party", "government", "policy", "bill",
    "money", "cash", "bank", "account", "transfer", "tax", "crore", "lakh", "rupees", "price",
    "friend", "family", "team", "match", "game", "player", "cricket", "football", "winner",
    "movie", "film", "show", "actor", "actress", "song", "music", "dance", "star",
    "best", "great", "bad", "big", "small", "free", "full", "fast", "slow", "sweet", "direct",
    "happy", "sad", "conspiracy", "slave", "era", "interview", "review", "season", "episode",
    "don", "stop", "laughing", "actually", "happened", "nostalgic", "smart", "cheapest", "wedding",
    "reach", "reason", "semi", "final", "excuses", "awesome", "esp", "too", "taste", "recipe",
    "dude", "biscuit", "sweet", "majority", "full", "strike", "surgical", "privacy", "right", "youth",
    "flights", "hotel", "save", "fan", "boxer", "underwear", "party", "indirectly", "punch",
    # Loanwords & code-switching vocabulary
    "office", "wire", "sir", "madam", "jail", "category", "fake", "id", "kudos",
    "pizza", "toilet", "coal", "scam", "silent", "note", "ban", "rapist", "agent",
    "loudspeaker", "cngrts", "congrats", "proove", "prove", "proved", "hr", "hour",
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "india", "pakistan", "australia", "worldcup", "muslim", "hindu", "bjp", "cwg", "nh", "mms",
    "comment", "comments", "test", "tests", "tested", "testing", "follower", "followers",
    "heart", "hearts", "joke", "jokes", "story", "stories", "yes", "yeah", "popular",
    "mutton", "chicken", "record", "records", "teaser", "trailer", "unplanned", "planned",
    "plan", "plans", "lol", "tender", "legal", "stump", "stumping", "pump", "pumping",
    "realisation", "realization", "realize", "realized", "papa", "mummy", "dad", "mom"
}

# Twitter metadata tokens that should not count as language evidence
TWITTER_META = {"rt", "via", "dm"}

# Devanagari Unicode range
DEVANAGARI_PATTERN = re.compile(r'[\u0900-\u097F]')


def detect_language(text: str) -> str:
    """
    Detect language of a text unit.
    Returns: 'en' | 'hi-latn' | 'mixed'
    
    Strategy:
    1. Check for Devanagari script:
       - If contains Latin English words alongside Devanagari -> 'mixed'
       - Pure Devanagari -> 'hi-latn'
    2. Extract word tokens and check against unambiguous Hindi markers,
       English common words, contextual homographs, and capitalized English tokens / proper nouns.
    3. Determine ratios and classify accurately across code-switching boundaries.
    """
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
    
    # Capitalized English tokens & proper nouns override (tuned to K=1)
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
        elif tok_lower in COMMON_ENGLISH_WORDS:
            capitalized_en_markers += 1
        # 4. English morphological suffixes (length > 5, e.g. -ing, -tion, -ment)
        elif (tok_lower.endswith('ing') or tok_lower.endswith('tion') or tok_lower.endswith('ment')) and len(tok_lower) > 5:
            capitalized_en_markers += 1


    words = re.findall(r'\b[a-zA-Z]+\b', clean_text.lower())
    if not words:
        return "en"

    total = len(words)
    hi_count = sum(1 for w in words if w in UNAMBIGUOUS_HINDI)
    en_count = sum(1 for w in words if w in COMMON_ENGLISH_WORDS)
    homo_count = sum(1 for w in words if w in HOMOGRAPHS)

    # Disambiguate homographs: if unambiguous Hindi exists, homographs count as Hindi
    if hi_count > 0:
        hi_count += homo_count
    else:
        en_count += homo_count

    hi_ratio = hi_count / total
    en_ratio = en_count / total

    # Override: if text contains >= K (K=1) capitalized English tokens / proper nouns alongside Hindi
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



def detect_language_bulk(texts: list[str]) -> list[str]:
    """Detect language for a list of texts."""
    return [detect_language(t) for t in texts]


def tag_chunk_language(chunk: str, parent_language_tag: Optional[str] = None) -> str:
    """
    Tag a child chunk's language.
    If parent was already tagged as hi-latn or mixed, the chunk inherits
    that unless it's clearly English.
    """
    detected = detect_language(chunk)
    if parent_language_tag in ('hi-latn', 'mixed') and detected == 'en':
        words = re.findall(r'\b[a-zA-Z]+\b', chunk.lower())
        has_any_hindi = any(w in UNAMBIGUOUS_HINDI for w in words)
        if has_any_hindi:
            return "mixed"
    return detected
