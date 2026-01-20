const mongoose = require("mongoose");

const simulationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    initialInvestment: Number,
    monthlyContribution: Number,
    annualReturn: Number,
    years: Number,
    projectedValue: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Simulation", simulationSchema);
