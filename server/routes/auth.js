import express from "express";
import bcrypt from "bcrypt";
import pool from "../db/index.js";
import jwt from "jsonwebtoken"

const router = express.Router();
const SALT_ROUNDS = 10;

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, password_hash],

    );
    jwt.sign({id : result.rows[0].id,
      email : result.rows[0].email
    },process.env.SECRET,{expiresIn : "7d"})


    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
