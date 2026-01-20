const express = require("express");
const Portfolio = require("../models/Portfolio");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/* CREATE ASSET */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const asset = await Portfolio.create({
      ...req.body,
      user: req.userId,
    });
    res.status(201).json(asset);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to add asset" });
  }
});

/* GET USER PORTFOLIO */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const assets = await Portfolio.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
});

/* DELETE ASSET */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Portfolio.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    res.json({ message: "Asset removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete asset" });
  }
});

module.exports = router;
