import re

# Pre-compiled regular expressions for enterprise secret and PII stripping
PATTERNS = [
    # Stripe Keys
    (re.compile(r'\b(sk_live_[0-9a-zA-Z]{24,})\b'), '[REDACTED_STRIPE_KEY]'),
    (re.compile(r'\b(sk_test_[0-9a-zA-Z]{24,})\b'), '[REDACTED_STRIPE_TEST_KEY]'),
    (re.compile(r'\b(pk_live_[0-9a-zA-Z]{24,})\b'), '[REDACTED_STRIPE_PUBLIC_KEY]'),
    
    # GitHub Tokens
    (re.compile(r'\b(gh[pousr]_[0-9a-zA-Z]{20,50})\b'), '[REDACTED_GITHUB_PAT]'),
    (re.compile(r'\b(github_pat_[0-9a-zA-Z_]{50,100})\b'), '[REDACTED_GITHUB_FINE_GRAINED_TOKEN]'),
    
    # AWS Access Keys
    (re.compile(r'\b(AKIA[0-9A-Z]{16})\b'), '[REDACTED_AWS_KEY_ID]'),
    (re.compile(r'\b(ASIA[0-9A-Z]{16})\b'), '[REDACTED_AWS_TEMP_KEY_ID]'),
    
    # Slack Tokens
    (re.compile(r'\b(xox[baprs]-[0-9a-zA-Z]{10,48})\b'), '[REDACTED_SLACK_TOKEN]'),
    
    # Generic API Keys / Tokens in code / chat: e.g. api_key = "...", apiKey: "..."
    (re.compile(r'(?i)\b(api[_-]?key|secret[_-]?key|auth[_-]?token|access[_-]?token)\s*[:=]\s*["\']?([a-zA-Z0-9_\-]{16,})["\']?'), r'\1: "[REDACTED_SECRET]"'),
    
    # Passwords in chat / JSON / configs
    (re.compile(r'(?i)\b(password|passwd|pwd)\s*[:=]\s*["\']?(\S+?)["\']?(\s|$|,|\})'), r'\1: "[REDACTED_PASSWORD]"\3'),
    
    # Bearer Authorization headers
    (re.compile(r'(?i)bearer\s+[a-zA-Z0-9_\-\.]{20,}'), 'Bearer [REDACTED_BEARER_TOKEN]'),
    
    # Basic Credit Card Numbers (13 to 16 digits formatted with spaces or hyphens)
    (re.compile(r'\b(?:\d[ -]*?){13,16}\b(?=\s|$)'), lambda m: '[REDACTED_CARD_NUMBER]' if sum(c.isdigit() for c in m.group(0)) in (13, 14, 15, 16) else m.group(0)),
]

def sanitize_text(content: str) -> str:
    """
    Sanitizes raw text from Slack, GitHub, Jira, or documents before ingestion.
    Strips API secrets, passwords, credentials, and payment data.
    """
    if not content or not isinstance(content, str):
        return content

    sanitized = content
    for pattern, replacement in PATTERNS:
        if callable(replacement):
            sanitized = pattern.sub(replacement, sanitized)
        else:
            sanitized = pattern.sub(replacement, sanitized)
            
    return sanitized
