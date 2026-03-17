import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import recipes from "./routes/recipes.js";
import savedRoutes from "./routes/saved.js";

const PORT = 4000;

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipes);
app.use("/api/saved", savedRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
