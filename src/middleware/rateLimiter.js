const rateLimit = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;
const AUTH_MAX_REQUESTS = 5;

const cleanupExpired = () => {
  const now = Date.now();
  for (const [key, entry] of rateLimit) {
    if (now - entry.windowStart > WINDOW_MS) {
      rateLimit.delete(key);
    }
  }
};

setInterval(cleanupExpired, 60 * 1000);

const createRateLimiter = (maxRequests = MAX_REQUESTS, windowMs = WINDOW_MS) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimit.has(key)) {
      rateLimit.set(key, { count: 1, windowStart: now });
      return next();
    }

    const entry = rateLimit.get(key);

    if (now - entry.windowStart > windowMs) {
      rateLimit.set(key, { count: 1, windowStart: now });
      return next();
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      res.set('Retry-After', retryAfter);
      res.set('X-RateLimit-Limit', maxRequests);
      res.set('X-RateLimit-Remaining', 0);
      res.set('X-RateLimit-Reset', new Date(entry.windowStart + windowMs).toISOString());
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter,
      });
    }

    res.set('X-RateLimit-Limit', maxRequests);
    res.set('X-RateLimit-Remaining', maxRequests - entry.count);
    res.set('X-RateLimit-Reset', new Date(entry.windowStart + windowMs).toISOString());
    next();
  };
};

const apiLimiter = createRateLimiter(MAX_REQUESTS, WINDOW_MS);
const authLimiter = createRateLimiter(AUTH_MAX_REQUESTS, WINDOW_MS);

module.exports = { createRateLimiter, apiLimiter, authLimiter };
