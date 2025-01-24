const mongoose = require('mongoose');

const personaAssignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Persona',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  assignedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for unique active assignments
personaAssignmentSchema.index(
  { userId: 1, personaId: 1, status: 1 }, 
  { unique: true, partialFilterExpression: { status: 'active' } }
);

module.exports = mongoose.model('PersonaAssignment', personaAssignmentSchema);