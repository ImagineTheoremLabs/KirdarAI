// models/GuestCode.js
const mongoose = require('mongoose');

const guestCodeSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  features: {
    mentorEnabled: {
      type: Boolean,
      default: false
    },
    evaluatorEnabled: {
      type: Boolean,
      default: false
    }
  },
  assignments: {
    personas: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Persona'
    }],
    scenarios: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scenario'
    }]
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GuestCode', guestCodeSchema);