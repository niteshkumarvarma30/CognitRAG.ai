#!/usr/bin/env python3
"""
CI Check: Claims Register Compliance
Ensures no banned or unverified claims appear in public homepage marketing code.
Spec: CognitRAG.ai - Homepage Rebuild Plan (Section 8.5)
"""

import sys
from pathlib import Path

BANNED_STRINGS = [
    "SOC 2",
    "SOC2",
    "HIPAA",
    "99.99%",
    "zero data retention",
    "Zero data retention",
    "Zero Data Retention",
    "DPDP",
    "RBI",
    "zero hallucinations",
    "Zero Hallucinations",
    "98.2%",
    "100% citation precision",
    "Personas",
    "Glean",
    "SEC 10-K"
]

TARGET_DIRS = [
    Path("frontend/app/components/marketing"),
    Path("frontend/app/app")
]

EXCLUDE_DIRS = ["_deferred", "node_modules", ".next", "(dashboard)"]

def main():
    root = Path(__file__).resolve().parent.parent
    violations = []

    for target_dir in TARGET_DIRS:
        full_path = root / target_dir
        if not full_path.exists():
            continue

        for file_path in full_path.rglob("*"):
            if not file_path.is_file() or file_path.suffix not in [".js", ".jsx", ".tsx", ".ts", ".html"]:
                continue

            # Skip excluded paths
            if any(exc in file_path.parts for exc in EXCLUDE_DIRS):
                continue

            # Only check homepage files
            if "app" in file_path.parts and file_path.name not in ["page.js", "layout.js", "globals.css"]:
                continue

            content = file_path.read_text(encoding="utf-8")
            for banned in BANNED_STRINGS:
                if banned.lower() in content.lower():
                    # Check if it's in a code comment explaining why it's banned or avoided
                    lines = content.splitlines()
                    for idx, line in enumerate(lines, 1):
                        if banned.lower() in line.lower() and not line.strip().startswith("//") and not line.strip().startswith("/*"):
                            violations.append((file_path.relative_to(root), idx, banned, line.strip()))

    if violations:
        print("\n[FAIL - CLAIMS REGISTER VIOLATION] Unverified marketing claims detected:")
        for file, line, term, snippet in violations:
            print(f"  - {file}:{line} -> Found banned term '{term}': {snippet}")
        print("\nPlease remove or verify against content/claims-register.md before publishing.\n")
        sys.exit(1)

    print("\n[PASS - CLAIMS REGISTER] All homepage files comply with content/claims-register.md.\n")
    sys.exit(0)

if __name__ == "__main__":
    main()
