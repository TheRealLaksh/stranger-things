// Minimal daily password backend for Stranger Things S5
import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET_KEY || "CHANGE_THIS_SECRET_KEY";

// Generate deterministic daily password
function getDailyPassword() {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const raw = `${SECRET}-${y}-${m}-${day}`;
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 8);
}

// For frontend validation
app.get("/api/check", (req, res) => {
  res.json({ valid: req.query.pass === getDailyPassword() });
});

// For external service to fetch today's password
app.get("/api/today", (req, res) => {
  res.json({ password: getDailyPassword() });
});

app.listen(PORT, () => {
  console.log("Daily password API running on port " + PORT);
});
