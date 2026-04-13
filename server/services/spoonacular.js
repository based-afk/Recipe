import axios from "axios";
import { getCached, setCached } from "./cache.js";

const BASE_URL = "https://api.spoonacular.com";
const inFlightRequests = new Map();

const executeWithApiKeyFailover = async (queryKey, requestWithKey) => {
  const apiKey = process.env.API_KEY;
  const apiKeyFallback = process.env.API_KEY_FALLBACK;

  if (!apiKey && !apiKeyFallback) {
    throw new Error("No Spoonacular API keys configured");
  }

  const primaryKey = apiKey || apiKeyFallback;

  try {
    return await requestWithKey(primaryKey);
  } catch (error) {
    const canFailover =
      Boolean(apiKeyFallback) && apiKeyFallback !== primaryKey;

    if (!canFailover) {
      throw error;
    }

    const status = error?.response?.status ?? "no-status";
    console.log(
      `Primary key failed (status: ${status}), retrying with fallback key for: ${queryKey}`,
    );
    return requestWithKey(apiKeyFallback);
  }
};

const fetchWithCoalescing = async (queryKey, fetcher) => {
  const cached = getCached(queryKey);
  if (cached) return cached;

  const existingPromise = inFlightRequests.get(queryKey);
  if (existingPromise) {
    console.log(`Coalescing request (piggybacking) for: ${queryKey}`);
    return existingPromise;
  }

  const pendingPromise = (async () => {
    try {
      console.log(`Executing raw DB/API query for: ${queryKey}`);
      const data = await fetcher();
      setCached(queryKey, data);
      return data;
    } finally {
      inFlightRequests.delete(queryKey);
    }
  })();

  inFlightRequests.set(queryKey, pendingPromise);
  return pendingPromise;
};

export const searchByIngredients = async (ingredients, diet) => {
  const key = `search:${ingredients}:${diet}`;
  return fetchWithCoalescing(key, async () => {
    const { data } = await executeWithApiKeyFailover(key, (apiKey) =>
      axios.get(`${BASE_URL}/recipes/complexSearch`, {
        params: {
          includeIngredients: ingredients,
          diet,
          number: 12,
          addRecipeInformation: true,
          apiKey,
        },
      }),
    );

    return data;
  });
};

export const getRecipeById = async (id) => {
  const key = `recipe:${id}`;
  return fetchWithCoalescing(key, async () => {
    const { data } = await executeWithApiKeyFailover(key, (apiKey) =>
      axios.get(`${BASE_URL}/recipes/${id}/information`, {
        params: { apiKey },
      }),
    );

    return data;
  });
};
