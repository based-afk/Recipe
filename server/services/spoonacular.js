import axios from "axios";
import { getCached, setCached } from "./cache.js";

const BASE_URL = "https://api.spoonacular.com";
const API_KEY = process.env.API_KEY;

export const searchByIngredients = async (ingredients, diet) => {
  const key = `search:${ingredients}:${diet}`;
  const cached = getCached(key);
  if (cached) return cached;

  const { data } = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
    params: {
      includeIngredients: ingredients,
      diet,
      number: 12,
      addRecipeInformation: true,
      apiKey: API_KEY,
    },
  });

  setCached(key, data);
  return data;
};

export const getRecipeById = async (id) => {
  const key = `recipe:${id}`;
  const cached = getCached(key);
  if (cached) return cached;

  const { data } = await axios.get(`${BASE_URL}/recipes/${id}/information`, {
    params: { apiKey: API_KEY },
  });

  setCached(key, data);
  return data;
};
