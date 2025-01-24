// models/UserPreference.js
const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  securityAlerts: {
    type: Boolean,
    default: true
  },
  marketingEmails: {
    type: Boolean,
    default: false
  },
  darkMode: {
    type: Boolean,
    default: true
  },
  autoSession: {
    type: Boolean,
    default: true
  },
  sessionTimeout: {
    type: Number,
    default: 30, // minutes
    min: 5,
    max: 1440 // 24 hours
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt']
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
}, {
  timestamps: true
});

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

module.exports = UserPreference;