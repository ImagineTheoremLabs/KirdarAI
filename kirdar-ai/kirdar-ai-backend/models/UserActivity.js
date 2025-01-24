// models/UserActivity.js
const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'profile_update',
      'password_change',
      'scenario_complete',
      'assessment_complete',
      'settings_update',
      'persona_interaction'
    ]
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    scenarioId: String,
    score: Number,
    duration: Number,  // in minutes
    details: String,
    progress: Number,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  ip: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for better query performance
userActivitySchema.index({ userId: 1, createdAt: -1 });
userActivitySchema.index({ type: 1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);