import express from "express";
import pool from "../db/index.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT r.spoonacular_id, r.title, r.image_url, r.ready_in_minutes, r.servings
       FROM saved_recipes sr
       JOIN recipes r ON sr.recipe_id = r.id
       WHERE sr.user_id = $1
       ORDER BY sr.saved_at DESC`,
      [user_id],
    );
    res.json({ recipes: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch saved recipes" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { spoonacular_id, title, image_url, ready_in_minutes, servings } =
    req.body;
  const user_id = req.user.id;

  try {
    const recipeResult = await pool.query(
      `INSERT INTO recipes (spoonacular_id, title, image_url, ready_in_minutes, servings)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (spoonacular_id) DO UPDATE SET title = EXCLUDED.title
       RETURNING id`,
      [spoonacular_id, title, image_url, ready_in_minutes, servings],
    );

    const recipe_id = recipeResult.rows[0].id;

    await pool.query(
      `INSERT INTO saved_recipes (user_id, recipe_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, recipe_id) DO NOTHING`,
      [user_id, recipe_id],
    );

    return res.status(201).json({ message: "Recipe saved" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to save recipe" });
  }
});

router.delete("/:spoonacularId", authenticate, async (req, res) => {
  const user_id = req.user.id;
  const { spoonacularId } = req.params;

  try {
    await pool.query(
      `DELETE FROM saved_recipes
       WHERE user_id = $1
         AND recipe_id = (SELECT id FROM recipes WHERE spoonacular_id = $2)`,
      [user_id, spoonacularId],
    );
    res.json({ message: "Recipe removed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove recipe" });
  }
});

export default router;
