const crypto = require('crypto');

let generated = null;

/**
 * Central JWT secret. Prefers JWT_SECRET from the environment; when missing,
 * generates a random secret per boot and warns loudly (tokens then only live
 * for the current process lifetime).
 */
function getSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (!generated) {
    generated = crypto.randomBytes(32).toString('hex');
    console.warn(
      '[auth] JWT_SECRET is not set — using a randomly generated secret. ' +
        'Sessions will be invalidated on every restart. Set JWT_SECRET in server/.env in production.'
    );
  }
  return generated;
}

module.exports = { getSecret };
