import os
import time
import re
from typing import List, Dict, Tuple, Optional

class TokenBucketRateLimiter:
    """
    Token-Bucket rate limiter designed to prevent HTTP 429 errors from:
    1. Groq Free Tier (Hard limit: 8,000 Tokens Per Minute)
       - We cap our internal ceiling at 6,000 TPM (75% headroom)
    2. NVIDIA NIM Free Tier (Dynamic limit: ~40-50 Requests Per Minute)
       - We cap our internal embedding requests at 35 RPM
    """
    def __init__(self, max_tokens_per_minute: int = 6000, max_requests_per_minute: int = 35):
        self.max_tpm = max_tokens_per_minute
        self.max_rpm = max_requests_per_minute
        self.token_window = []  # [(timestamp, token_count)]
        self.request_window = []  # [timestamp]

    def _clean_windows(self, now: float):
        cutoff = now - 60.0
        self.token_window = [item for item in self.token_window if item[0] > cutoff]
        self.request_window = [t for t in self.request_window if t > cutoff]

    def acquire_tokens(self, estimated_tokens: int):
        """
        Pauses execution dynamically if consuming `estimated_tokens` would exceed the TPM ceiling.
        """
        while True:
            now = time.time()
            self._clean_windows(now)
            current_tokens = sum(cnt for _, cnt in self.token_window)
            
            if current_tokens + estimated_tokens <= self.max_tpm:
                self.token_window.append((now, estimated_tokens))
                return
            
            # Need to wait until the oldest tokens fall outside the 60s window
            oldest_ts = self.token_window[0][0]
            sleep_duration = max(0.1, (oldest_ts + 60.0) - now + 0.05)
            time.sleep(sleep_duration)

    def acquire_request(self):
        """
        Paces requests to avoid RPM limit (e.g. for NVIDIA NIM embeddings).
        """
        while True:
            now = time.time()
            self._clean_windows(now)
            if len(self.request_window) < self.max_rpm:
                self.request_window.append(now)
                return
            
            oldest_req = self.request_window[0]
            sleep_duration = max(0.1, (oldest_req + 60.0) - now + 0.05)
            time.sleep(sleep_duration)


class UploadQuotaGuard:
    """
    Enforces strict upload limits per user/workspace to protect infrastructure:
    - Free Tier: Max 50 files, Max 50,000 LOC, Max 10MB zip, Max 500KB per file
    - Pro Tier:  Max 250 files, Max 250,000 LOC, Max 50MB zip, Max 2MB per file
    """
    FREE_TIER = {
        "max_files": 50,
        "max_loc": 50000,
        "max_archive_mb": 10.0,
        "max_single_file_kb": 500.0,
        "max_pdf_mb": 10.0,
        "max_pdf_pages": 50,
    }
    
    PRO_TIER = {
        "max_files": 250,
        "max_loc": 250000,
        "max_archive_mb": 50.0,
        "max_single_file_kb": 2048.0,
        "max_pdf_mb": 25.0,
        "max_pdf_pages": 150,
    }

    @classmethod
    def validate_upload(cls, files_meta: List[Dict], plan_tier: str = "free") -> Tuple[bool, Optional[str]]:
        limits = cls.PRO_TIER if plan_tier == "pro" else cls.FREE_TIER
        
        if len(files_meta) > limits["max_files"]:
            return False, f"Upload exceeds maximum allowed file count ({len(files_meta)} > {limits['max_files']} for {plan_tier} tier). Please upgrade or use .codeignore."
        
        total_loc = sum(f.get("loc", 0) for f in files_meta)
        if total_loc > limits["max_loc"]:
            return False, f"Repository size exceeds maximum allowed LOC ({total_loc:,} > {limits['max_loc']:,} LOC for {plan_tier} tier)."
        
        for f in files_meta:
            size_kb = f.get("size_bytes", 0) / 1024.0
            if size_kb > limits["max_single_file_kb"]:
                return False, f"File '{f.get('path')}' ({size_kb:.1f} KB) exceeds the single file limit of {limits['max_single_file_kb']} KB."
                
        return True, None

    @classmethod
    def validate_pdf(cls, file_bytes: bytes, filename: str, plan_tier: str = "free") -> Tuple[bool, Optional[str], int]:
        limits = cls.PRO_TIER if plan_tier == "pro" else cls.FREE_TIER
        size_mb = len(file_bytes) / (1024.0 * 1024.0)

        if size_mb > limits["max_pdf_mb"]:
            return False, f"PDF file size ({size_mb:.1f} MB) exceeds maximum allowed {limits['max_pdf_mb']} MB for {plan_tier} tier.", 0

        page_count = 1
        try:
            import fitz
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            page_count = doc.page_count
            doc.close()
        except Exception:
            try:
                import PyPDF2
                import io
                reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                page_count = len(reader.pages)
            except Exception:
                # If page count cannot be determined, permit if size within limit
                page_count = 1

        if page_count > limits["max_pdf_pages"]:
            return False, f"PDF page count ({page_count} pages) exceeds maximum allowed {limits['max_pdf_pages']} pages for {plan_tier} tier. Technical architecture docs must be under {limits['max_pdf_pages']} pages.", page_count

        return True, None, page_count


class CodeFilter:
    """
    Automatic .codeignore filter. Strips useless bloat (node_modules, .git, lockfiles,
    binaries) before AST parsing or LLM tokenization to save bandwidth and tokens.
    """
    IGNORED_DIRS = {
        "node_modules", ".git", ".next", "dist", "build", "__pycache__", 
        "venv", ".venv", "env", ".env", "coverage", ".idea", ".vscode", 
        ".pytest_cache", ".ruff_cache", "target", "vendor", "bin", "obj"
    }

    IGNORED_FILES = {
        "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "poetry.lock", 
        "cargo.lock", "gemfile.lock", "composer.lock"
    }

    IGNORED_EXTENSIONS = {
        # Binaries & Compiled
        ".exe", ".dll", ".so", ".dylib", ".class", ".jar", ".war", ".pyc", ".o", ".a",
        # Minified / Source Maps
        ".min.js", ".min.css", ".map", ".wasm",
        # Media & Assets
        ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".mp4", ".mov", ".avi",
        ".mp3", ".wav", ".pdf", ".zip", ".tar", ".gz", ".7z", ".rar", ".ttf", ".woff", ".woff2"
    }

    ALLOWED_CODE_EXTENSIONS = {
        ".py", ".js", ".jsx", ".ts", ".tsx", ".go", ".rs", ".java", 
        ".cpp", ".c", ".h", ".hpp", ".cs", ".php", ".rb", ".swift", 
        ".kt", ".scala", ".sql", ".json", ".yaml", ".yml", ".md", ".sh"
    }

    @classmethod
    def should_ignore(cls, filepath: str) -> bool:
        normalized = filepath.replace("\\", "/").strip("/")
        parts = normalized.split("/")

        # Check directory names
        for part in parts[:-1]:
            if part.lower() in cls.IGNORED_DIRS or part.startswith("."):
                return True

        filename = parts[-1].lower()
        if filename in cls.IGNORED_FILES:
            return True

        for ext in cls.IGNORED_EXTENSIONS:
            if filename.endswith(ext):
                return True

        # Check allowed extensions
        _, file_ext = os.path.splitext(filename)
        if file_ext not in cls.ALLOWED_CODE_EXTENSIONS:
            return True

        return False


# Global singleton instance for the process
global_token_limiter = TokenBucketRateLimiter(max_tokens_per_minute=6000, max_requests_per_minute=35)
