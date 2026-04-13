import express from "express";
import pool from "../db/index.js";
import { getRecipeById, searchByIngredients } from "../services/spoonacular.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  const { ingredients, diet } = req.query;

  if (!ingredients) {
    return res.status(400).json({ error: "Ingredients are required" });
  }

  try {
    const normalizedQuery = String(ingredients)
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" ");

    const query = `
      SELECT
        r.spoonacular_id AS id,
        r.title,
        r.image_url AS image,
        NULL::text AS "imageType",
        r.ready_in_minutes AS "readyInMinutes",
        r.servings,
        NULL::double precision AS "spoonacularScore",
        NULL::integer AS "aggregateLikes"
      FROM recipes r
      WHERE
        r.search_vector @@ websearch_to_tsquery('english', $1)
        OR word_similarity($1, r.title) >= 0.3
        OR word_similarity($1, COALESCE(r.ingredients, '')) >= 0.3
      ORDER BY
        GREATEST(word_similarity($1, r.title), word_similarity($1, COALESCE(r.ingredients, ''))) DESC,
        ts_rank_cd(r.search_vector, websearch_to_tsquery('english', $1)) DESC,
        r.id DESC
      LIMIT 50
    `;

    let result;
    try {
      result = await pool.query(query, [normalizedQuery]);
    } catch (dbError) {
      console.error(`[DB Error] Falling back to API for: ${normalizedQuery}`);
      console.error("[recipes/search:db]", dbError.message);

      const apiResponse = await searchByIngredients(ingredients, diet);
      const apiResults = apiResponse?.results ?? [];
      const apiTotalResults = apiResponse?.totalResults ?? apiResults.length;

      return res.status(200).json({
        recipeDetails: {
          results: apiResults,
          totalResults: apiTotalResults,
        },
        source: "api",
      });
    }

    if (result.rows.length > 0) {
      console.log(
        `[DB Hit] Found ${result.rows.length} recipes for: ${normalizedQuery}`,
      );
      return res.status(200).json({
        recipeDetails: {
          results: result.rows,
          totalResults: result.rowCount,
        },
        source: "database",
      });
    }

    console.log(`[DB Miss] Hitting Spoonacular API for: ${normalizedQuery}`);
    const apiResponse = await searchByIngredients(ingredients, diet);
    const apiResults = apiResponse?.results ?? [];
    const apiTotalResults = apiResponse?.totalResults ?? apiResults.length;

    return res.status(200).json({
      recipeDetails: {
        results: apiResults,
        totalResults: apiTotalResults,
      },
      source: "api",
    });
  } catch (error) {
    console.error("[recipes/search]", error.message);
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
