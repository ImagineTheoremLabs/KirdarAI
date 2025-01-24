// models/TrainingCode.js
const mongoose = require('mongoose');

const trainingCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timesUsed: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Method to check if code is valid
trainingCodeSchema.methods.isValid = function() {
  return this.status === 'active';
};

const TrainingCode = mongoose.model('TrainingCode', trainingCodeSchema);

module.exports = TrainingCode;