const express = require('express');
const Goal = require('../models/Goal');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/* ======================
   CREATE GOAL
====================== */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      target_amount,
      current_amount,
      deadline,
      category,
    } = req.body;

    // Basic validation
    if (!name || !target_amount || !deadline || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const goal = await Goal.create({
      user: req.userId, // ✅ correct
      name,
      target_amount,
      current_amount: current_amount || 0,
      deadline,
      category,
    });

    res.status(201).json(goal);
  } catch (err) {
    console.error('Error creating goal:', err);
    res.status(500).json({ message: 'Failed to create goal' });
  }
});

/* ======================
   GET USER GOALS
====================== */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error('Error fetching goals:', err);
    res.status(500).json({ message: 'Failed to fetch goals' });
  }
});

/* ======================
   DELETE GOAL
====================== */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedGoal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!deletedGoal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    res.json({ message: 'Goal deleted' });
  } catch (err) {
    console.error('Error deleting goal:', err);
    res.status(500).json({ message: 'Failed to delete goal' });
  }
});

module.exports = router;
