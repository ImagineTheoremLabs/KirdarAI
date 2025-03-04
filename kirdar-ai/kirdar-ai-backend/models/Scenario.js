const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    enum: ['financial', 'sales', 'medical', 'legal', 'counseling', 'education'],
    default: 'financial'
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  objectives: [{
    type: String,
    required: true
  }],
  prerequisites: [{
    type: String
  }],
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  },
  keyPoints: [{
    type: String
  }],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'document', 'other'],
      default: 'article'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
scenarioSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Scenario', scenarioSchema); 