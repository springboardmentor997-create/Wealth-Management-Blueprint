const express = require("express");
const User = require("../models/User");
const Goal = require("../models/Goal");
const Portfolio = require("../models/Portfolio");

const router = express.Router();

/* ======================
   ADMIN DASHBOARD STATS
====================== */
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGoals = await Goal.countDocuments();
    const activePortfolios = await Portfolio.distinct("user");

    res.json({
      totalUsers,
      totalGoals,
      activePortfolios: activePortfolios.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load admin stats" });
  }
});

/* ======================
   GET ALL USERS
====================== */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ======================
   DELETE USER
====================== */
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Goal.deleteMany({ user: req.params.id });
    await Portfolio.deleteMany({ user: req.params.id });

    res.json({ message: "User and related data deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;
