import os
import fitz  # PyMuPDF
import pymupdf4llm
from langchain_text_splitters import RecursiveCharacterTextSplitter

def parse_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a raw PDF byte stream and converts it into Markdown format."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    md_text = pymupdf4llm.to_markdown(doc)
    return md_text

def chunk_text(text: str) -> list[str]:
    """Chunks Markdown text logically using Recursive Chunking."""
    
    # Parent Splitter (2000 characters)
    parent_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=800,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    
    print("  -> Creating Parent Chunks...")
    parent_docs = parent_splitter.split_text(text)
    
    return parent_docs
