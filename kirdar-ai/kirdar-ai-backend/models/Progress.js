// models/Progress.js
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionnaireResponses: {
    type: Object,
    default: {}
  },
  completedScenarios: [{
    scenarioId: String,
    completedAt: Date,
    score: Number,
    feedback: String
  }],
  skillLevels: {
    clientCommunication: { type: Number, default: 1 },
    financialPlanning: { type: Number, default: 1 },
    riskManagement: { type: Number, default: 1 },
    portfolioManagement: { type: Number, default: 1 }
  }
}, {
  timestamps: true
});

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;