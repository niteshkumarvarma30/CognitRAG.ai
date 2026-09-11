import os
import sqlite3
import json
import hashlib
from typing import Optional, List, Dict, Any

class IngestionCache:
    """
    SQLite-backed persistent hash cache for embeddings and graph extraction.
    Guarantees 100% idempotency and avoids repeating costly API calls
    or hitting rate limit quotas during development, restarts, and benchmarks.
    """
    def __init__(self, db_path: str = "data/real_enterprise/real_ingestion_cache.sqlite"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            # Table for text embeddings
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS embedding_cache (
                    content_hash TEXT PRIMARY KEY,
                    model_name TEXT NOT NULL,
                    embedding_json TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Table for graph entity & relationship extractions
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS graph_extraction_cache (
                    content_hash TEXT PRIMARY KEY,
                    model_name TEXT NOT NULL,
                    entities_json TEXT NOT NULL,
                    relations_json TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Table for parsed documents and chunks
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS parsed_chunk_cache (
                    doc_filename TEXT NOT NULL,
                    chunk_index INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    metadata_json TEXT NOT NULL,
                    PRIMARY KEY (doc_filename, chunk_index)
                )
            """)
            conn.commit()

    @staticmethod
    def compute_hash(text: str) -> str:
        return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()

    def get_embedding(self, text: str, model_name: str) -> Optional[List[float]]:
        content_hash = self.compute_hash(text)
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT embedding_json FROM embedding_cache WHERE content_hash = ? AND model_name = ?",
                (content_hash, model_name)
            )
            row = cursor.fetchone()
            if row:
                return json.loads(row[0])
        return None

    def set_embedding(self, text: str, model_name: str, embedding: List[float]):
        content_hash = self.compute_hash(text)
        embedding_json = json.dumps(embedding)
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO embedding_cache (content_hash, model_name, embedding_json)
                VALUES (?, ?, ?)
            """, (content_hash, model_name, embedding_json))
            conn.commit()

    def get_graph_extraction(self, text: str, model_name: str) -> Optional[Dict[str, Any]]:
        content_hash = self.compute_hash(text)
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT entities_json, relations_json FROM graph_extraction_cache WHERE content_hash = ? AND model_name = ?",
                (content_hash, model_name)
            )
            row = cursor.fetchone()
            if row:
                return {
                    "entities": json.loads(row[0]),
                    "relations": json.loads(row[1])
                }
        return None

    def set_graph_extraction(self, text: str, model_name: str, entities: List[str], relations: List[Dict[str, str]]):
        content_hash = self.compute_hash(text)
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO graph_extraction_cache (content_hash, model_name, entities_json, relations_json)
                VALUES (?, ?, ?, ?)
            """, (content_hash, model_name, json.dumps(entities), json.dumps(relations)))
            conn.commit()

    def get_cache_stats(self) -> Dict[str, int]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM embedding_cache")
            embeddings = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM graph_extraction_cache")
            graphs = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM parsed_chunk_cache")
            chunks = cursor.fetchone()[0]
            return {
                "cached_embeddings": embeddings,
                "cached_graphs": graphs,
                "cached_chunks": chunks
            }

ingestion_cache = IngestionCache()
