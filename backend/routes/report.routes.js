const express = require("express");
const auth = require("../middleware/auth");
const Goal = require("../models/Goal");
const Portfolio = require("../models/Portfolio");

const router = express.Router();

/* ===========================
   GET REPORT SUMMARY
=========================== */
router.get("/summary", auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.userId });
    const portfolio = await Portfolio.find({ user: req.userId });

    let totalInvested = 0;
    let totalValue = 0;

    portfolio.forEach((p) => {
      totalInvested += p.invested_amount;
      totalValue += p.current_value;
    });

    res.json({
      portfolioSummary: {
        total_value: totalValue,
        total_invested: totalInvested,
        total_gain_loss: totalValue - totalInvested,
        gain_loss_percentage:
          totalInvested === 0
            ? 0
            : ((totalValue - totalInvested) / totalInvested) * 100,
        asset_allocation: {
          Stocks: 40,
          ETFs: 30,
          Crypto: 20,
          Cash: 10,
        },
      },
      goals,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load report data" });
  }
});

module.exports = router;
