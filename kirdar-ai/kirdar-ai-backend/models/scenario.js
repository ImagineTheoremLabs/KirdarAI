// models/Scenario.js
const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    default: 'Target'
  },
  difficulty: {
    type: String,
    enum: ['Intermediate', 'Advanced', 'Expert'],
    required: true
  },
  objectives: [{
    type: String
  }],
  estimatedTime: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
scenarioSchema.index({ category: 1, difficulty: 1 });
scenarioSchema.index({ isActive: 1 });

const Scenario = mongoose.model('Scenario', scenarioSchema);

module.exports = Scenario;