import os
import fitz  # PyMuPDF
import pymupdf4llm
from langchain_text_splitters import RecursiveCharacterTextSplitter

def parse_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a raw PDF byte stream and converts it into Markdown format. Limited to 20 pages for local testing."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages_to_process = list(range(min(20, len(doc))))
        md_text = pymupdf4llm.to_markdown(doc, pages=pages_to_process)
        return md_text
    except Exception as e:
        print(f"pymupdf4llm failed with {e}. Falling back to standard PyMuPDF text extraction.")
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        pages_to_process = min(20, len(doc))
        for i in range(pages_to_process):
            text += doc[i].get_text("text") + "\n\n"
        return text

import re

def clean_financial_text(text: str) -> str:
    """Removes XBRL tags, URLs, and noisy metadata from financial documents."""
    # Remove XML/XBRL tags (e.g. <us-gaap:...> or </us-gaap:...>)
    text = re.sub(r'<[^>]+>', '', text)
    # Remove URLs
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    # Strip table-of-contents dot leaders (e.g. ................ 12)
    text = re.sub(r'\.{4,}', ' ', text)
    # Remove excessive blank lines and whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove purely numeric/symbolic lines that are just table artifacts
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        # Skip lines that are just numbers, punctuation, or empty
        if not stripped or re.fullmatch(r'[\d\.\,\%\$\-\s]+', stripped):
            continue
        cleaned_lines.append(line)
    return "\n".join(cleaned_lines)

def chunk_text(text: str) -> list[str]:
    """Chunks Markdown text logically using Recursive Chunking."""
    
    print("  -> Cleaning raw financial text...")
    text = clean_financial_text(text)
    
    # Parent Splitter (2000 characters)
    parent_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=800,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    
    print("  -> Creating Parent Chunks...")
    parent_docs = parent_splitter.split_text(text)
    
    return parent_docs
