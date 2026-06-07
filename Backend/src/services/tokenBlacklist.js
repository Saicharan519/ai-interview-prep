// TTL-based in-memory token blacklist.
//
// Tokens are stored with their expiry timestamp so the Map self-prunes and
// never grows unboundedly. A token evicted after expiry is already invalid
// by its own JWT signature, so this is safe.
//
// KNOWN LIMITATION: This store does not survive process restarts. A logged-out
// token becomes valid again after a restart until it expires naturally via JWT.
// For true persistence, replace this with Redis using SET key 1 EX <ttl_seconds>.
const blacklist = new Map(); // token -> expiresAt (ms timestamp)

const JWT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // must match JWT expiresIn in authController

export function addToBlacklist(token) {
  const expiresAt = Date.now() + JWT_TTL_MS;
  blacklist.set(token, expiresAt);
  pruneExpired();
}

export function isBlacklisted(token) {
  const expiresAt = blacklist.get(token);
  if (expiresAt === undefined) return false;

  if (Date.now() > expiresAt) {
    blacklist.delete(token);
    return false;
  }

  return true;
}

function pruneExpired() {
  const now = Date.now();
  for (const [token, expiresAt] of blacklist) {
    if (now > expiresAt) blacklist.delete(token);
  }
}

// Exposed for testing only
export function blacklistSize() {
  return blacklist.size;
}
