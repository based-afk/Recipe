import pool from "./db/index.js";

const seedDatabase = async () => {
  try {
    console.log(" Planting the zucchini...");
    await pool.query(`
      INSERT INTO recipes (spoonacular_id, title, ingredients, ready_in_minutes, servings) 
      VALUES (999999, 'Ultimate Zucchini Fritters', 'zucchini, flour, egg, garlic', 30, 2)
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Zucchini successfully planted in the database!");
  } catch (error) {
    console.error("❌ Failed to plant:", error);
  } finally {
    process.exit(0);
  }
};

seedDatabase();
