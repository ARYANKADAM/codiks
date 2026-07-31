import "server-only";

const buckets = new Map();

/**
 * In-memory sliding-window rate limiter. Works correctly on a single
 * Node.js process — it does NOT share state across multiple serverless
 * instances or horizontally-scaled containers. Fine for a single-process
 * deployment (VPS, Railway, Render). If you later deploy to a
 * multi-instance serverless platform, swap this for Upstash Redis
 * (@upstash/ratelimit) — same call signature, different backend.
 */
export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { windowStart: now, count: 1 });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, retryAfterMs: windowMs - (now - entry.windowStart) };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}

// Periodic cleanup so the Map doesn't grow unbounded over a long-running process.
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > 10 * 60 * 1000) buckets.delete(key);
  }
}, 5 * 60 * 1000);
cleanupInterval.unref?.();

export default rateLimit;