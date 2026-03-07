import express from "express";
import { searchByIngredients, getRecipeById } from "../services/spoonacular.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  const { ingredients, diet } = req.query;

  if (!ingredients) {
    return res.status(400).json({ error: "Ingredients are required" });
  }

  try {
    const response = await searchByIngredients(ingredients, diet);
    return res.status(200).json({ recipeDetails: response });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const response = await getRecipeById(id);
    return res.status(200).json({ recipeDetails: response });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

export default router;
