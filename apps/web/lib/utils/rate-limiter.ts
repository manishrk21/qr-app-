/**
 * Simple in-memory rate limiter
 * Production: use Redis-based solution (upstash, ioredis, etc.)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const storage = new Map<string, RateLimitEntry>();

/**
 * Check if request is rate limited
 * @param key - Unique identifier (IP, phone number, etc.)
 * @param limit - Max requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 10 * 60 * 1000 // 10 minutes default
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = storage.get(key);

  // New entry or expired
  if (!entry || entry.resetAt < now) {
    storage.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs
    };
  }

  // Increment count
  entry.count++;

  const allowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt
  };
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string): void {
  storage.delete(key);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearRateLimits(): void {
  storage.clear();
}

/**
 * Get client IP from request
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}
