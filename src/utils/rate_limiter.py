import time
import asyncio
from functools import wraps

class TokenBucketRateLimiter:
    """
    A basic Token Bucket rate limiter to prevent hitting Groq's 8,000 TPM free tier limits.
    """
    def __init__(self, tokens_per_minute: int = 7500):
        self.capacity = tokens_per_minute
        self.tokens = self.capacity
        self.refill_rate = self.capacity / 60.0  # Tokens per second
        self.last_update = time.time()

    def _refill(self):
        now = time.time()
        elapsed = now - self.last_update
        new_tokens = elapsed * self.refill_rate
        self.tokens = min(self.capacity, self.tokens + new_tokens)
        self.last_update = now

    def consume(self, estimated_tokens: int):
        """Blocks until there are enough tokens to consume."""
        self._refill()
        while self.tokens < estimated_tokens:
            time.sleep(0.5)
            self._refill()
        self.tokens -= estimated_tokens

def with_exponential_backoff(max_retries: int = 4, base_delay: float = 2.0):
    """
    Decorator that applies exponential backoff for 429 Rate Limit Errors.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    error_msg = str(e).lower()
                    if "429" in error_msg or "rate limit" in error_msg or "too many requests" in error_msg:
                        retries += 1
                        if retries >= max_retries:
                            print(f"[RateLimiter] Max retries reached. Failing: {e}")
                            raise e
                        
                        delay = base_delay * (2 ** (retries - 1))
                        print(f"[RateLimiter] 429 Rate Limit Hit. Backing off for {delay} seconds...")
                        time.sleep(delay)
                    else:
                        raise e
        return wrapper
    return decorator

# Global shared rate limiter for Groq routing
groq_rate_limiter = TokenBucketRateLimiter(tokens_per_minute=7500)
