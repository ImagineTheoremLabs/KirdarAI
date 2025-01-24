const mongoose = require('mongoose');

const scenarioAssignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scenarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'inactive'],
    default: 'active'
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  completedDate: Date,
  performance: {
    score: Number,
    duration: Number, // in minutes
    attempts: {
      type: Number,
      default: 0
    },
    feedback: String
  }
}, {
  timestamps: true
});

// Create compound index for unique active assignments
scenarioAssignmentSchema.index(
  { userId: 1, scenarioId: 1, status: 1 }, 
  { unique: true, partialFilterExpression: { status: 'active' } }
);

module.exports = mongoose.model('ScenarioAssignment', scenarioAssignmentSchema);