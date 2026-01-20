const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/* GET PROFILE */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

/* UPDATE PROFILE */
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Profile update failed' });
  }
});

module.exports = router;
