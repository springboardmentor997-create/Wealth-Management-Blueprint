const express = require("express");
const Simulation = require("../models/Simulation");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/* ================================
   RUN & SAVE SIMULATION
================================ */
router.post("/run", authMiddleware, async (req, res) => {
  try {
    const {
      initialInvestment,
      monthlyContribution,
      annualReturn,
      inflationRate,
      years,
    } = req.body;

    // basic validation
    if (!initialInvestment || !years) {
      return res.status(400).json({ message: "Invalid input" });
    }

    let totalValue = initialInvestment;
    let contributed = initialInvestment;
    const timeline = [];

    for (let year = 1; year <= years; year++) {
      totalValue += monthlyContribution * 12;
      contributed += monthlyContribution * 12;

      totalValue *= 1 + annualReturn / 100;
      totalValue *= 1 - inflationRate / 100;

      timeline.push({
        year,
        value: Math.round(totalValue),
        contributed: Math.round(contributed),
      });
    }

    const simulation = await Simulation.create({
      user: req.userId,
      initialInvestment,
      monthlyContribution,
      annualReturn,
      years,
      projectedValue: Math.round(totalValue),
    });

    res.json({
      projectedValue: simulation.projectedValue,
      contributed,
      confidence: 85,
      timeline,
    });
  } catch (err) {
    console.error("Simulation error:", err);
    res.status(500).json({ message: "Simulation failed" });
  }
});

module.exports = router;
