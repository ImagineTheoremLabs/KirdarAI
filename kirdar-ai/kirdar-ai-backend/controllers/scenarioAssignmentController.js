const ScenarioAssignment = require('../models/ScenarioAssignment');
const User = require('../models/User');
const Scenario = require('../models/Scenario');

const assignScenario = async (req, res) => {
  try {
    const { userId, scenarioId } = req.body;

    console.log('Assigning scenario:', { userId, scenarioId });

    // Validate input
    if (!userId || !scenarioId) {
      return res.status(400).json({ 
        message: 'userId and scenarioId are required' 
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify scenario exists
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    // Check if assignment already exists and is active
    const existingAssignment = await ScenarioAssignment.findOne({
      userId,
      scenarioId,
      status: 'active'
    });

    if (existingAssignment) {
      return res.status(400).json({ 
        message: 'Scenario already assigned to this user' 
      });
    }

    // Create new assignment or reactivate old one
    const assignment = await ScenarioAssignment.findOneAndUpdate(
      { userId, scenarioId },
      { 
        userId,
        scenarioId,
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
    console.error('Error assigning scenario:', error);
    res.status(500).json({ message: 'Error assigning scenario' });
  }
};

const getUserAssignments = async (req, res) => {
  try {
    const assignments = await ScenarioAssignment.find({
      userId: req.params.userId,
      status: { $in: ['active', 'completed'] }
    })
    .populate('scenarioId')
    .sort('-assignedDate');

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { status, performance } = req.body;

    const assignment = await ScenarioAssignment.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'completed' ? { completedDate: new Date() } : {}),
        ...(performance ? { performance } : {})
      },
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
    const assignment = await ScenarioAssignment.findByIdAndUpdate(
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
  assignScenario,
  getUserAssignments,
  updateAssignment,
  deleteAssignment
};