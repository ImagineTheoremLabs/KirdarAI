// models/Traineeship.js
const mongoose = require('mongoose');

const traineeshipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  codeUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingCode',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  // Track assigned content
  assignments: [{
    type: {
      type: String,
      enum: ['persona', 'scenario'],
      required: true
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'assignments.contentType'
    },
    contentType: {
      type: String,
      required: true,
      enum: ['Persona', 'Scenario']
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    score: Number
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
traineeshipSchema.index({ userId: 1, adminId: 1 }, { unique: true });
traineeshipSchema.index({ adminId: 1, status: 1 });

// Prevent multiple active traineeships for the same user
traineeshipSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('status')) {
    const existingActive = await this.constructor.findOne({
      userId: this.userId,
      status: 'active',
      _id: { $ne: this._id }
    });

    if (existingActive && this.status === 'active') {
      throw new Error('User already has an active traineeship');
    }
  }
  next();
});

const Traineeship = mongoose.model('Traineeship', traineeshipSchema);

module.exports = Traineeship;