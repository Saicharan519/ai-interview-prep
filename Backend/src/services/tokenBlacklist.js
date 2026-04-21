// In-memory store for blacklisted tokens
// For production, replace with Redis using SET with TTL equal to JWT expiry (7 days)
const blacklist = new Set();

export function addToBlacklist(token) {
  blacklist.add(token);
}

export function isBlacklisted(token) {
  return blacklist.has(token);
}

export { blacklist };
