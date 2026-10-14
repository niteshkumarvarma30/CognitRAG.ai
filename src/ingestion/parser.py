"""
CognitRAG v2 — Ingestion Parser
Parses various document types into normalized text.
Removed financial text cleaner (SEC-specific, not in scope).
"""
import re
import fitz           # PyMuPDF
import pymupdf4llm
from langchain_text_splitters import RecursiveCharacterTextSplitter


def parse_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a raw PDF byte stream and converts to Markdown."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        md_text = pymupdf4llm.to_markdown(doc)
        return md_text
    except Exception as e:
        print(f"pymupdf4llm failed ({e}). Falling back to standard extraction.")
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n\n"
        return text


def parse_markdown(text: str) -> str:
    """Clean markdown text — remove excessive whitespace."""
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    return text


def parse_slack_text(text: str) -> str:
    """
    Clean Slack message text:
    - Resolve <@USER_ID> mentions to readable format
    - Remove Slack formatting markers
    - Keep Hinglish intact — do NOT translate
    """
    # Replace user mentions with placeholder
    text = re.sub(r'<@\w+>', '@user', text)
    # Replace channel mentions
    text = re.sub(r'<#\w+\|(\w+)>', r'#\1', text)
    # Remove link formatting but keep URL text
    text = re.sub(r'<(https?://[^|>]+)\|([^>]+)>', r'\2 (\1)', text)
    text = re.sub(r'<(https?://[^>]+)>', r'\1', text)
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def chunk_text(text: str, language_tag: str = "en") -> list[str]:
    """
    Chunk text into parent chunks for pipeline processing.
    Language-aware: Hinglish text uses smaller chunks
    (shorter sentences, context shifts more frequently).
    """
    # Adjust chunk size for Hinglish — shorter sentences, more context-dense
    if language_tag in ("hi-latn", "mixed"):
        chunk_size = 1500
        chunk_overlap = 600
    else:
        chunk_size = 2000
        chunk_overlap = 800

    parent_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", "।", " ", ""]  # ।  = Devanagari danda
    )

    parent_docs = parent_splitter.split_text(text)
    return [doc.strip() for doc in parent_docs if doc.strip()]
