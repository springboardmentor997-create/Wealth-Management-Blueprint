const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    target_amount: {
      type: Number,
      required: true,
    },

    current_amount: {
      type: Number,
      default: 0,
    },

    deadline: {
      type: Date,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
