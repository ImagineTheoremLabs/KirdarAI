// controllers/adminController.js
const TrainingCode = require('../models/TrainingCode');
const Traineeship = require('../models/Traineeship');
const User = require('../models/User');
const crypto = require('crypto');

// Generate unique training codes
const generateTrainingCode = async (req, res) => {
  try {
    console.log('Generating code, user:', req.user);
    
    // Verify admin status
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to generate codes' });
    }

    // Generate unique code
    const code = crypto.randomBytes(6).toString('hex').toUpperCase();
    
    const trainingCode = await TrainingCode.create({
      code,
      createdBy: req.user._id,
      status: 'active'
    });

    // Add code to admin's active codes
    await User.findByIdAndUpdate(req.user._id, {
      $push: { 'adminProfile.activeCodes': trainingCode._id }
    });

    res.status(201).json(trainingCode);
  } catch (error) {
    console.error('Error generating training code:', error);
    res.status(500).json({ message: 'Error generating training code' });
  }
};

// List all trainees for an admin
const getTrainees = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view trainees' });
    }

    const traineeships = await Traineeship.find({ adminId: req.user._id })
      .populate('userId', 'name email lastActive')
      .populate('codeUsed', 'code createdAt')
      .sort('-createdAt');

    const summary = await req.user.getTrainingProgramSummary();

    res.json({
      traineeships,
      summary
    });
  } catch (error) {
    console.error('Error fetching trainees:', error);
    res.status(500).json({ message: 'Error fetching trainees' });
  }
};

// Manage training codes
const getTrainingCodes = async (req, res) => {
  try {
    console.log('Fetching codes, user:', req.user);
    
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view codes' });
    }

    const codes = await TrainingCode.find({ createdBy: req.user._id })
      .sort('-createdAt');

    console.log('Fetched codes:', codes);
    res.json(codes);
  } catch (error) {
    console.error('Error fetching training codes:', error);
    res.status(500).json({ message: 'Error fetching training codes' });
  }
};

// Deactivate training code
const deleteCode = async (req, res) => {
  try {
    console.log('Deleting code:', req.params.codeId);
    
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete codes' });
    }

    // Find and delete the code
    const code = await TrainingCode.findOneAndDelete({
      _id: req.params.codeId,
      createdBy: req.user._id
    });

    if (!code) {
      return res.status(404).json({ message: 'Training code not found' });
    }

    // Remove from admin's active codes array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { 'adminProfile.activeCodes': code._id }
    });

    console.log('Successfully deleted code:', code.code);
    res.json({ message: 'Training code deleted successfully' });
  } catch (error) {
    console.error('Error deleting code:', error);
    res.status(500).json({ 
      message: 'Error deleting training code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Assign content to trainee
const assignContent = async (req, res) => {
  try {
    const { traineeId, contentType, contentId } = req.body;

    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to assign content' });
    }

    const traineeship = await Traineeship.findOne({
      userId: traineeId,
      adminId: req.user._id,
      status: 'active'
    });

    if (!traineeship) {
      return res.status(404).json({ message: 'Active traineeship not found' });
    }

    traineeship.assignments.push({
      type: contentType,
      contentId,
      contentType: contentType === 'persona' ? 'Persona' : 'Scenario'
    });

    await traineeship.save();

    res.json({ message: 'Content assigned successfully', traineeship });
  } catch (error) {
    console.error('Error assigning content:', error);
    res.status(500).json({ message: 'Error assigning content' });
  }
};

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view dashboard' });
    }

    const summary = await req.user.getTrainingProgramSummary();
    const activeCodes = await TrainingCode.find({
      createdBy: req.user._id,
      status: 'active'
    }).count();

    res.json({
      ...summary,
      activeCodes
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

module.exports = {
  generateTrainingCode,
  getTrainees,
  getTrainingCodes,
  deleteCode,
  assignContent,
  getDashboardStats
};