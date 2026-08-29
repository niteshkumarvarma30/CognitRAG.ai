"""
test_all_apis.py
Comprehensive test of every API key and model used in the RAG SaaS project.
Reads from .env automatically.
"""

import os, sys, json, time, urllib.request, urllib.error, socket

# ── Load .env ──────────────────────────────────────────────────────────────────
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

results = []

def ok(label, detail=""):
    tag = f"{GREEN}OK  PASS{RESET}"
    print(f"  {tag}  {label}" + (f" -- {detail}" if detail else ""))
    results.append({"label": label, "status": "PASS", "detail": detail})

def fail(label, detail=""):
    tag = f"{RED}XX  FAIL{RESET}"
    print(f"  {tag}  {label}" + (f" -- {detail}" if detail else ""))
    results.append({"label": label, "status": "FAIL", "detail": detail})

def warn(label, detail=""):
    tag = f"{YELLOW}--  SKIP{RESET}"
    print(f"  {tag}  {label}" + (f" -- {detail}" if detail else ""))
    results.append({"label": label, "status": "SKIP", "detail": detail})

def section(title):
    print(f"\n{BOLD}{CYAN}{'='*60}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'='*60}{RESET}")

def http_get(url, headers=None, timeout=10):
    req = urllib.request.Request(url)
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, json.loads(r.read().decode())

def http_post(url, payload, headers=None, timeout=15):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, json.loads(r.read().decode())

def can_resolve(host):
    try:
        socket.gethostbyname(host)
        return True
    except Exception:
        return False

# =================== 1. GitHub Token ===================
section("1. GitHub Token")
gh_token = os.environ.get("GITHUB_TOKEN", "")
if gh_token:
    try:
        _, data = http_get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {gh_token}",
                     "Accept": "application/vnd.github+json",
                     "X-GitHub-Api-Version": "2022-11-28"},
        )
        ok("GitHub Token", f"user={data.get('login')} ({data.get('name')})")
    except urllib.error.HTTPError as e:
        fail("GitHub Token", f"HTTP {e.code}")
    except Exception as e:
        fail("GitHub Token", str(e))
else:
    warn("GitHub Token", "GITHUB_TOKEN not set")

# =================== 2. NVIDIA API ===================
section("2. NVIDIA API  (integrate.api.nvidia.com)")
nvidia_key = os.environ.get("NVIDIA_API_KEY", "")
NVIDIA_BASE = "https://integrate.api.nvidia.com/v1"

if not can_resolve("integrate.api.nvidia.com"):
    warn("NVIDIA API", "DNS resolution failed -- network blocked")
elif nvidia_key:
    # 2a. Embedding
    try:
        status, data = http_post(
            f"{NVIDIA_BASE}/embeddings",
            {"input": ["hello"], "model": "nvidia/nv-embedqa-e5-v5",
             "input_type": "query", "encoding_format": "float"},
            headers={"Authorization": f"Bearer {nvidia_key}"},
        )
        dim = len(data["data"][0]["embedding"])
        ok("nvidia/nv-embedqa-e5-v5  [Embedding]", f"dim={dim}")
    except urllib.error.HTTPError as e:
        fail("nvidia/nv-embedqa-e5-v5  [Embedding]", f"HTTP {e.code}: {e.read().decode()[:150]}")
    except Exception as e:
        fail("nvidia/nv-embedqa-e5-v5  [Embedding]", str(e))

    # 2b. Nemotron reasoning (judge)
    try:
        status, data = http_post(
            f"{NVIDIA_BASE}/chat/completions",
            {"model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
             "messages": [{"role": "user", "content": "Reply with just: OK"}],
             "max_tokens": 20},
            headers={"Authorization": f"Bearer {nvidia_key}"},
            timeout=30,
        )
        reply = data["choices"][0]["message"]["content"].strip()[:60]
        ok("nvidia/nemotron-3-nano-omni-30b-a3b-reasoning  [Judge LLM]", f'reply="{reply}"')
    except urllib.error.HTTPError as e:
        fail("nvidia/nemotron  [Judge LLM]", f"HTTP {e.code}: {e.read().decode()[:150]}")
    except Exception as e:
        fail("nvidia/nemotron  [Judge LLM]", str(e))

    # 2c. Llama via NVIDIA
    try:
        status, data = http_post(
            f"{NVIDIA_BASE}/chat/completions",
            {"model": "meta/llama-3.1-70b-instruct",
             "messages": [{"role": "user", "content": "Reply with just: OK"}],
             "max_tokens": 20},
            headers={"Authorization": f"Bearer {nvidia_key}"},
            timeout=30,
        )
        reply = data["choices"][0]["message"]["content"].strip()[:60]
        ok("meta/llama-3.1-70b-instruct  [via NVIDIA]", f'reply="{reply}"')
    except urllib.error.HTTPError as e:
        fail("meta/llama-3.1-70b-instruct  [via NVIDIA]", f"HTTP {e.code}: {e.read().decode()[:150]}")
    except Exception as e:
        fail("meta/llama-3.1-70b-instruct  [via NVIDIA]", str(e))
else:
    warn("NVIDIA API", "NVIDIA_API_KEY not set")

# =================== 3. Groq API ===================
section("3. Groq API  (api.groq.com)")
GROQ_BASE = "https://api.groq.com/openai/v1"
groq_keys = {
    "GROQ_API_KEY":   os.environ.get("GROQ_API_KEY", ""),
    "GROQ_API_KEY_2": os.environ.get("GROQ_API_KEY_2", ""),
}

if not can_resolve("api.groq.com"):
    warn("Groq API", "DNS resolution failed -- network blocked")
else:
    for key_name, groq_key in groq_keys.items():
        if not groq_key:
            warn(f"Groq [{key_name}]", "not set")
            continue
        try:
            status, data = http_post(
                f"{GROQ_BASE}/chat/completions",
                {"model": "openai/gpt-oss-20b",
                 "messages": [{"role": "user", "content": "Reply with just: OK"}],
                 "max_tokens": 20},
                headers={"Authorization": f"Bearer {groq_key}"},
                timeout=20,
            )
            reply = data["choices"][0]["message"]["content"].strip()[:60]
            ok(f"openai/gpt-oss-20b  [Groq / {key_name}]", f'reply="{reply}"')
        except urllib.error.HTTPError as e:
            body = e.read().decode()[:200]
            fail(f"openai/gpt-oss-20b  [Groq / {key_name}]", f"HTTP {e.code}: {body}")
        except Exception as e:
            fail(f"openai/gpt-oss-20b  [Groq / {key_name}]", str(e))

# =================== 4. Gemini API ===================
section("4. Gemini API  (generativelanguage.googleapis.com)")
gemini_key = os.environ.get("GEMINI_API_KEY", "")
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai"

if not can_resolve("generativelanguage.googleapis.com"):
    warn("Gemini API", "DNS resolution failed -- network blocked")
elif gemini_key:
    try:
        status, data = http_post(
            f"{GEMINI_BASE}/chat/completions",
            {"model": "gemini-2.5-flash",
             "messages": [{"role": "user", "content": "Reply with just: OK"}],
             "max_tokens": 20},
            headers={"Authorization": f"Bearer {gemini_key}"},
            timeout=20,
        )
        reply = data["choices"][0]["message"]["content"].strip()[:60]
        ok("gemini-2.5-flash  [Ingestion LLM]", f'reply="{reply}"')
    except urllib.error.HTTPError as e:
        fail("gemini-2.5-flash  [Ingestion LLM]", f"HTTP {e.code}: {e.read().decode()[:200]}")
    except Exception as e:
        fail("gemini-2.5-flash  [Ingestion LLM]", str(e))
else:
    warn("Gemini API", "GEMINI_API_KEY not set")

# =================== 5. Jina AI Reranker ===================
section("5. Jina AI  (api.jina.ai) -- Reranker")
jina_key = os.environ.get("JINA_API_KEY", "")

if not can_resolve("api.jina.ai"):
    warn("Jina AI", "DNS resolution failed -- network blocked")
elif jina_key:
    try:
        status, data = http_post(
            "https://api.jina.ai/v1/rerank",
            {"model": "jina-reranker-v2-base-multilingual",
             "query": "What is the revenue?",
             "documents": ["Revenue was 100B", "The sky is blue"],
             "top_n": 2},
            headers={"Authorization": f"Bearer {jina_key}"},
            timeout=15,
        )
        top = data["results"][0].get("document", "")
        if isinstance(top, dict):
            top = top.get("text", "")
        top = str(top)[:60]
        ok("jina-reranker-v2-base-multilingual", f'top="{top}"')
    except urllib.error.HTTPError as e:
        fail("jina-reranker-v2-base-multilingual", f"HTTP {e.code}: {e.read().decode()[:200]}")
    except Exception as e:
        fail("jina-reranker-v2-base-multilingual", str(e))
else:
    warn("Jina AI", "JINA_API_KEY not set")

# =================== 6. Sarvam AI ===================
section("6. Sarvam AI  (api.sarvam.ai)")
sarvam_key = os.environ.get("SARVAM_API_KEY", "")

if not can_resolve("api.sarvam.ai"):
    warn("Sarvam AI", "DNS resolution failed -- network blocked")
elif sarvam_key:
    # Sarvam only has 2 models: sarvam-105b and sarvam-105b-conversations
    # sarvam-105b-conversations is the confirmed working chat model
    try:
        status, data = http_post(
            "https://api.sarvam.ai/v1/chat/completions",
            {"model": "sarvam-105b-conversations",
             "messages": [{"role": "user", "content": "Reply with just: OK"}],
             "max_tokens": 20},
            headers={"Authorization": f"Bearer {sarvam_key}"},
            timeout=20,
        )
        reply = (data["choices"][0]["message"]["content"] or "").strip()[:60]
        ok("sarvam-105b-conversations  [Sarvam AI]", f'reply="{reply}"')
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:250]
        fail("sarvam-105b-conversations  [Sarvam AI]", f"HTTP {e.code}: {body}")
    except Exception as e:
        fail("sarvam-105b-conversations  [Sarvam AI]", str(e))
else:
    warn("Sarvam AI", "SARVAM_API_KEY not set")

# =================== 7. OpenRouter ===================
section("7. OpenRouter  (openrouter.ai)")
or_key = os.environ.get("OPENROUTER_API_KEY", "")

if not can_resolve("openrouter.ai"):
    warn("OpenRouter", "DNS resolution failed -- network blocked")
elif or_key:
    # Model list
    try:
        status, data = http_get(
            "https://openrouter.ai/api/v1/models",
            headers={"Authorization": f"Bearer {or_key}"},
            timeout=15,
        )
        total = len(data.get("data", []))
        ok("OpenRouter -- models list", f"{total} models available")
    except urllib.error.HTTPError as e:
        fail("OpenRouter -- models list", f"HTTP {e.code}: {e.read().decode()[:150]}")
    except Exception as e:
        fail("OpenRouter -- models list", str(e))

    # Chat test
    try:
        status, data = http_post(
            "https://openrouter.ai/api/v1/chat/completions",
            {"model": "meta-llama/llama-3.1-8b-instruct:free",
             "messages": [{"role": "user", "content": "Reply with just: OK"}],
             "max_tokens": 20},
            headers={"Authorization": f"Bearer {or_key}",
                     "HTTP-Referer": "http://localhost"},
            timeout=20,
        )
        reply = data["choices"][0]["message"]["content"].strip()[:60]
        ok("meta-llama/llama-3.1-8b-instruct:free  [OpenRouter]", f'reply="{reply}"')
    except urllib.error.HTTPError as e:
        fail("OpenRouter chat test", f"HTTP {e.code}: {e.read().decode()[:200]}")
    except Exception as e:
        fail("OpenRouter chat test", str(e))
else:
    warn("OpenRouter", "OPENROUTER_API_KEY not set")

# =================== 8. GitHub Models ===================
section("8. GitHub Models API  (models.inference.ai.azure.com)")
if not can_resolve("models.inference.ai.azure.com"):
    warn("GitHub Models", "models.inference.ai.azure.com DNS blocked -- use VPN")
elif gh_token:
    try:
        status, data = http_post(
            "https://models.inference.ai.azure.com/chat/completions",
            {"model": "gpt-4o-mini",
             "messages": [{"role": "user", "content": "Reply with just: OK"}],
             "max_tokens": 20},
            headers={"Authorization": f"Bearer {gh_token}"},
            timeout=20,
        )
        reply = data["choices"][0]["message"]["content"].strip()[:60]
        ok("gpt-4o-mini  [GitHub Models]", f'reply="{reply}"')
    except urllib.error.HTTPError as e:
        fail("gpt-4o-mini  [GitHub Models]", f"HTTP {e.code}: {e.read().decode()[:200]}")
    except Exception as e:
        fail("gpt-4o-mini  [GitHub Models]", str(e))

# =================== SUMMARY ===================
section("SUMMARY")
passed  = [r for r in results if r["status"] == "PASS"]
failed  = [r for r in results if r["status"] == "FAIL"]
skipped = [r for r in results if r["status"] == "SKIP"]

print(f"\n  {GREEN}PASS : {len(passed)}{RESET}")
print(f"  {RED}FAIL : {len(failed)}{RESET}")
print(f"  {YELLOW}SKIP : {len(skipped)}{RESET}")

if failed:
    print(f"\n{RED}  Failed checks:{RESET}")
    for r in failed:
        print(f"    X  {r['label']}  -->  {r['detail']}")

print()
