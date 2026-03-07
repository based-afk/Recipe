const cache = new Map();
const TTL = 10 * 60 * 1000;

export const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

export const setCached = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};
