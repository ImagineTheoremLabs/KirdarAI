// models/Persona.js
const mongoose = require('mongoose');

const personaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  income: {
    type: String,
    required: true
  },
  portfolio: {
    type: String,
    required: true
  },
  riskTolerance: {
    type: String,
    required: true,
    enum: ['Low', 'Moderate', 'High']
  },
  goals: {
    type: String,
    required: true
  },
  concerns: {
    type: String,
    required: true
  },
  knowledgeLevel: {
    type: String,
    required: true,
    enum: ['Basic', 'Intermediate', 'Advanced']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Remove any _id specific configuration
// Remove the compound index that was causing issues
// personaSchema.index({ name: 1, isActive: 1 }, { unique: true });

module.exports = mongoose.model('Persona', personaSchema);