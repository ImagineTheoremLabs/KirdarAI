// controllers/personaAssignmentController.js
const PersonaAssignment = require('../models/PersonaAssignment');
const User = require('../models/User');
const Persona = require('../models/Persona');

const assignPersona = async (req, res) => {
  try {
    const { userId, personaId } = req.body;

    console.log('Assigning persona:', { userId, personaId });

    // Validate input
    if (!userId || !personaId) {
      return res.status(400).json({ 
        message: 'userId and personaId are required' 
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify persona exists
    const persona = await Persona.findById(personaId);
    if (!persona) {
      return res.status(404).json({ message: 'Persona not found' });
    }

    // Check if assignment already exists and is active
    const existingAssignment = await PersonaAssignment.findOne({
      userId,
      personaId,
      status: 'active'
    });

    if (existingAssignment) {
      return res.status(400).json({ 
        message: 'Persona already assigned to this user' 
      });
    }

    // Create new assignment or reactivate old one
    const assignment = await PersonaAssignment.findOneAndUpdate(
      { userId, personaId },
      { 
        userId,
        personaId,
        status: 'active',
        assignedDate: new Date()
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('Created assignment:', assignment);
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error assigning persona:', error);
    res.status(500).json({ message: 'Error assigning persona' });
  }
};

const getUserAssignments = async (req, res) => {
  try {
    const assignments = await PersonaAssignment.find({
      userId: req.params.userId,
      status: 'active'
    })
    .populate('personaId')
    .sort('-assignedDate');

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { status } = req.body;

    const assignment = await PersonaAssignment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Error updating assignment' });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await PersonaAssignment.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ message: 'Assignment removed' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Error deleting assignment' });
  }
};

module.exports = {
  assignPersona,
  getUserAssignments,
  updateAssignment,
  deleteAssignment
};