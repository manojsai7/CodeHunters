/**
 * Simple in-memory rate limiter for API routes.
 * Works with serverless — state resets on cold start, which is acceptable
 * since it still blocks burst abuse within a warm instance window.
 *
 * For production at scale, swap to @upstash/ratelimit with Redis.
 */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Clean up stale entries periodically (every 60s)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60_000);

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check whether the given key is within the rate limit.
 * @param key   Unique identifier (e.g., IP + route)
 * @param limit Max requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract client IP from request headers (works behind Vercel/Cloudflare).
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
