// controllers/adminGuestController.js
const crypto = require('crypto');
const GuestCode = require('../models/GuestCode');

// Generate new guest access code
const generateCode = async (req, res) => {
  try {
    console.log('Received generate code request with body:', req.body);

    // Generate a unique 6-character code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Create the guest code with assignments and features
    const guestCode = await GuestCode.create({
      code,
      createdBy: req.user._id,
      status: 'active',
      features: req.body.features || {},
      assignments: {
        personas: req.body.assignments?.personas || [],
        scenarios: req.body.assignments?.scenarios || []
      }
    });

    console.log('Created guest code:', guestCode);

    // Populate the assignments
    const populatedCode = await GuestCode.findById(guestCode._id)
      .populate('assignments.personas')
      .populate('assignments.scenarios');

    console.log('Populated guest code:', populatedCode);

    res.status(201).json(populatedCode);
  } catch (error) {
    console.error('Error generating guest code:', error);
    res.status(500).json({ message: 'Failed to generate guest code' });
  }
};

// Get all guest codes for admin
const getCodes = async (req, res) => {
  try {
    const codes = await GuestCode.find({
      createdBy: req.user._id
    })
    .sort('-createdAt')
    .populate('assignments.personas')
    .populate('assignments.scenarios');

    res.json(codes);
  } catch (error) {
    console.error('Error fetching guest codes:', error);
    res.status(500).json({ message: 'Failed to fetch guest codes' });
  }
};

// Update guest code assignments
const updateAssignments = async (req, res) => {
  try {
    const { codeId } = req.params;
    const { personas, scenarios } = req.body;

    const code = await GuestCode.findOneAndUpdate(
      { _id: codeId, createdBy: req.user._id },
      {
        'assignments.personas': personas,
        'assignments.scenarios': scenarios
      },
      { new: true }
    )
    .populate('assignments.personas')
    .populate('assignments.scenarios');

    if (!code) {
      return res.status(404).json({ message: 'Guest code not found' });
    }

    res.json(code);
  } catch (error) {
    console.error('Error updating guest code assignments:', error);
    res.status(500).json({ message: 'Failed to update assignments' });
  }
};

// Deactivate guest code
const deactivateCode = async (req, res) => {
  try {
    const { codeId } = req.params;

    const code = await GuestCode.findOneAndUpdate(
      { _id: codeId, createdBy: req.user._id },
      { status: 'inactive' },
      { new: true }
    );

    if (!code) {
      return res.status(404).json({ message: 'Guest code not found' });
    }

    res.json({ message: 'Guest code deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating guest code:', error);
    res.status(500).json({ message: 'Failed to deactivate guest code' });
  }
};

module.exports = {
  generateCode,
  getCodes,
  updateAssignments,
  deactivateCode
};