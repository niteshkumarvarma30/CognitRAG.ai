import json
import re

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
    "flights", "hotel", "save", "fan", "boxer", "underwear", "party", "indirectly", "punch"
}

DEVANAGARI_PATTERN = re.compile(r'[\u0900-\u097F]')

def classify_text(text: str) -> str:
    if not text or len(text.strip()) < 5:
        return "en"

    if DEVANAGARI_PATTERN.search(text):
        en_latin = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        if len(en_latin) >= 2:
            return "mixed"
        return "hi-latn"

    words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
    if not words:
        return "en"

    total = len(words)
    hi_count = sum(1 for w in words if w in UNAMBIGUOUS_HINDI)
    en_count = sum(1 for w in words if w in COMMON_ENGLISH_WORDS)
    homo_count = sum(1 for w in words if w in HOMOGRAPHS)

    if hi_count > 0:
        hi_count += homo_count
    else:
        en_count += homo_count

    hi_ratio = hi_count / total
    en_ratio = en_count / total

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

# Test on 120 samples
with open("Evaluation/results/comi_lingua_traces.json", "r", encoding="utf-8") as f:
    traces = json.load(f)

correct = 0
per_label = {"hi-latn": {"corr": 0, "tot": 0}, "en": {"corr": 0, "tot": 0}, "mixed": {"corr": 0, "tot": 0}}
matrix = {
    "gold_hi-latn": {"pred_hi-latn": 0, "pred_en": 0, "pred_mixed": 0},
    "gold_en": {"pred_hi-latn": 0, "pred_en": 0, "pred_mixed": 0},
    "gold_mixed": {"pred_hi-latn": 0, "pred_en": 0, "pred_mixed": 0}
}

for t in traces:
    gold = t["gold_label"]
    pred = classify_text(t["text"])
    per_label[gold]["tot"] += 1
    matrix[f"gold_{gold}"][f"pred_{pred}"] += 1
    if pred == gold:
        correct += 1
        per_label[gold]["corr"] += 1

print(f"Overall Accuracy: {correct}/{len(traces)} = {correct/len(traces)*100:.2f}%\n")
for lbl, d in per_label.items():
    acc = d["corr"] / d["tot"] * 100 if d["tot"] else 0
    print(f"  {lbl} (N={d['tot']}): {d['corr']}/{d['tot']} = {acc:.2f}%")

print("\nConfusion Matrix:")
print(json.dumps(matrix, indent=2))
