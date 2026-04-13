import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import recipes from "./routes/recipes.js";
import savedRoutes from "./routes/saved.js";

// const PORT = 4000;

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

const PORT = 4000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server successfully holding port ${PORT}`);
});

// This catches the silent crashes!
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `❌ PORT ${PORT} IS ALREADY IN USE! You have a zombie Node process.`,
    );
    process.exit(1);
  } else {
    console.error(`❌ FATAL SERVER ERROR:`, err);
    process.exit(1);
  }
});

process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED PROMISE REJECTION:", err);
  process.exit(1);
});
