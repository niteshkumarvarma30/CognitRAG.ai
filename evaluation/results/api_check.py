"""
CognitRAG v4 — API Health Check
Run this FIRST before any evaluation script.
Fails loudly with a clear error if any judge or dataset is unavailable.
"""
import os, sys, requests
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv()

GROQ_KEY  = os.environ.get("GROQ_API_KEY", "").strip().strip("'\"")
NVIDIA_KEY = os.environ.get("NVIDIA_API_KEY", "").strip().strip("'\"")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip().strip("'\"")
SUPABASE_SRK = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip().strip("'\"")

GROQ_BASE   = "https://api.groq.com/openai/v1"
NVIDIA_BASE = "https://integrate.api.nvidia.com/v1"

JUDGE_A = "openai/gpt-oss-20b"
JUDGE_B = "qwen/qwen3.8-27b"
NVIDIA_TIEBREAKER = "nvidia/nemotron-3-ultra-550b-a55b"

CHECKS_PASSED = []
CHECKS_FAILED = []

def ok(name):
    CHECKS_PASSED.append(name)
    print(f"  ✅  {name}")

def fail(name, reason):
    CHECKS_FAILED.append(name)
    print(f"  ❌  {name}: {reason}")

def check_groq_judge(model: str, label: str):
    try:
        r = requests.post(f"{GROQ_BASE}/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={"model": model, "messages": [{"role": "user", "content": "Respond with exactly one word: SUPPORTED"}], "max_tokens": 5},
            timeout=15)
        if r.status_code == 200:
            reply = r.json()["choices"][0]["message"]["content"].strip()
            ok(f"{label} ({model}) → '{reply}'")
        else:
            fail(label, f"HTTP {r.status_code}: {r.text[:80]}")
    except Exception as e:
        fail(label, str(e)[:80])

def check_nvidia_judge():
    try:
        r = requests.post(f"{NVIDIA_BASE}/chat/completions",
            headers={"Authorization": f"Bearer {NVIDIA_KEY}", "Content-Type": "application/json"},
            json={"model": NVIDIA_TIEBREAKER,
                  "messages": [{"role": "user", "content": "Say SUPPORTED"}],
                  "max_tokens": 5},
            timeout=30)
        if r.status_code == 200:
            reply = r.json()["choices"][0]["message"]["content"].strip()
            ok(f"NVIDIA Tiebreaker ({NVIDIA_TIEBREAKER}) → '{reply[:30]}'")
        else:
            fail("NVIDIA Tiebreaker", f"HTTP {r.status_code}: {r.text[:80]}")
    except Exception as e:
        fail("NVIDIA Tiebreaker", str(e)[:80])

def check_supabase():
    try:
        r = requests.get(f"{SUPABASE_URL}/rest/v1/eval_runs?limit=1",
            headers={"apikey": SUPABASE_SRK, "Authorization": f"Bearer {SUPABASE_SRK}"},
            timeout=10)
        if r.status_code in (200, 206):
            ok(f"Supabase public.eval_runs accessible")
        elif r.status_code == 404:
            fail("Supabase", "eval_runs table not found — run db/001_eval_runs_schema.sql first")
        else:
            fail("Supabase", f"HTTP {r.status_code}: {r.text[:80]}")
    except Exception as e:
        fail("Supabase", str(e)[:80])

def check_dataset(name, loader_fn):
    try:
        loader_fn()
        ok(f"Dataset: {name}")
    except Exception as e:
        fail(f"Dataset: {name}", str(e)[:100])

def _load_squad():
    from datasets import load_dataset
    ds = load_dataset("rajpurkar/squad_v2", split="validation")
    assert len(ds) > 100

def _load_comi():
    from datasets import load_dataset
    ds = load_dataset("LingoIITGN/COMI-LINGUA", "LID", split="train")
    assert len(ds) > 100

if __name__ == "__main__":
    print("\n" + "="*55)
    print("  CognitRAG v4 — Pre-flight API Check")
    print("="*55)

    print("\n[1/4] Groq Judges")
    check_groq_judge(JUDGE_A, "Judge A (gpt-oss-20b)")
    check_groq_judge(JUDGE_B, "Judge B (qwen3.8-27b)")

    print("\n[2/4] NVIDIA Tiebreaker")
    check_nvidia_judge()

    print("\n[3/4] Supabase Schema")
    check_supabase()

    print("\n[4/4] Datasets")
    check_dataset("rajpurkar/squad_v2 (HGQA base)", _load_squad)
    check_dataset("LingoIITGN/COMI-LINGUA", _load_comi)

    print("\n" + "="*55)
    print(f"  PASSED: {len(CHECKS_PASSED)}")
    print(f"  FAILED: {len(CHECKS_FAILED)}")
    print("="*55)

    if CHECKS_FAILED:
        print(f"\n🚨  STOP — Fix these before running any eval:")
        for f in CHECKS_FAILED:
            print(f"    • {f}")
        sys.exit(1)
    else:
        print("\n✅  All checks passed. Ready to run evaluations.\n")
