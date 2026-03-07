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
