import pool from "./db/index.js";
import express from "express";
import authRoutes from "./routes/auth.js";
import recipes from "./routes/recipes.js";

const PORT = 4000;

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
