import hashlib
import json
from collections import OrderedDict
from datetime import datetime, timedelta
from dataclasses import dataclass
from typing import Any

@dataclass
class CacheEntry:
    key: str
    value: Any
    timestamp: datetime
    access_count: int = 0
    ttl_seconds: int = None

    def is_expired(self):
        return self.ttl_seconds is not None and (datetime.now() - self.timestamp > timedelta(seconds=self.ttl_seconds))

class LRUCache:
    def __init__(self, max_size=1000):
        self.cache = OrderedDict()
        self.max_size = max_size
        self.hits = 0
        self.misses = 0

    def generate_key(self, *args, **kwargs) -> str:
        key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True)
        return hashlib.sha256(key_data.encode()).hexdigest()

    def get(self, key: str) -> Any:
        if key in self.cache:
            entry = self.cache[key]
            if entry.is_expired():
                del self.cache[key]
                self.misses += 1
                return None
            entry.access_count += 1
            self.cache.move_to_end(key)
            self.hits += 1
            return entry.value
        self.misses += 1
        return None

    def put(self, key: str, value: Any, ttl_seconds: int = None):
        if key in self.cache:
            entry = self.cache[key]
            entry.value = value
            entry.timestamp = datetime.now()
            entry.ttl_seconds = ttl_seconds
            self.cache.move_to_end(key)
        else:
            if len(self.cache) >= self.max_size:
                self.cache.popitem(last=False)
            self.cache[key] = CacheEntry(key, value, datetime.now(), ttl_seconds=ttl_seconds)

    def get_stats(self):
        total = self.hits + self.misses
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(self.hits / total, 2) if total else 0.0,
            "size": len(self.cache)
        }

from src.database.repos.cache import lookup_cache as db_lookup_cache
from src.database.repos.cache import save_cache as db_save_cache
from src.database.repos.context import RequestContext

async def check_semantic_cache(
    ctx: RequestContext,
    query_embedding: list[float],
    threshold: float = 0.95,
    entity_guard: list[str] = None
) -> dict | None:
    """Audience-isolated semantic cache lookup."""
    return await db_lookup_cache(ctx, query_embedding, threshold=threshold, entity_guard=entity_guard)

async def store_semantic_cache(
    ctx: RequestContext,
    query: str,
    response: str,
    query_embedding: list[float],
    entity_guard: list[str] = None,
    ttl_seconds: int = None
) -> bool:
    """Audience-isolated semantic cache write."""
    return await db_save_cache(ctx, query, response, query_embedding, entity_guard=entity_guard, ttl_seconds=ttl_seconds)
