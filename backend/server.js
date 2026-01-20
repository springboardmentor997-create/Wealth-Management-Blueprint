const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const goalRoutes = require("./routes/goal.routes");
const adminRoutes = require("./routes/admin.routes");
const userRoutes = require("./routes/user.routes");
const portfolioRoutes = require("./routes/portfolio.routes");
const simulationRoutes = require("./routes/simulation.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();

/* ================================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================================
   DATABASE CONNECTION
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
  });

/* ================================
   ROUTES
================================ */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/simulations", simulationRoutes);
app.use("/api/reports", reportRoutes);

/* ✅ ADMIN ROUTES (ONLY ONCE) */
app.use("/api/admin", adminRoutes);

/* ================================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.json({ message: "Wealth Management Backend Running" });
});

/* ================================
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
