import os
import fitz  # PyMuPDF
import pymupdf4llm
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_community.embeddings import JinaEmbeddings
from langchain_experimental.text_splitter import SemanticChunker
from dotenv import load_dotenv

load_dotenv()

def parse_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a raw PDF byte stream and converts it into Markdown format."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    md_text = pymupdf4llm.to_markdown(doc)
    return md_text

def chunk_text(text: str) -> list[tuple[str, str]]:
    """Chunks Markdown text logically using Recursive Chunking, returning (parent, child) pairs."""
    
    # 1. Initialize Recursive Chunker for Parent Chunks
    parent_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    
    # Create broad semantic parent chunks
    print("  -> Running Recursive Chunking for Parents (2000 chars)...")
    parent_docs = parent_splitter.split_text(text)
    
    # 2. Child Splitter for precise embeddings
    child_splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    
    chunk_pairs = []
    print("  -> Creating Child Chunks (400 chars)...")
    for parent_text in parent_docs:
        # Split parent into children
        children = child_splitter.split_text(parent_text)
        
        for child in children:
            chunk_pairs.append((parent_text, child))
            
    return chunk_pairs
