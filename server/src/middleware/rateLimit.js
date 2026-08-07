/**
 * Minimal in-memory rate limiter for the admin login route.
 * (A production deploy should prefer a distributed limiter, but this is
 * plenty to blunt brute-force attempts on a portfolio site.)
 */

const attempts = new Map();

function loginRateLimit({ windowMs = 60 * 1000, max = 5 } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = attempts.get(key);

    // Keep the map from growing unboundedly
    if (attempts.size > 5000) {
      for (const [k, v] of attempts) {
        if (now - v.start > windowMs) attempts.delete(k);
      }
    }

    if (!record || now - record.start > windowMs) {
      attempts.set(key, { start: now, count: 1 });
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      return res
        .status(429)
        .json({ message: 'Too many login attempts. Please wait a minute and try again.' });
    }
    return next();
  };
}

module.exports = { loginRateLimit };
