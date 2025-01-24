// routes/personaRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const Persona = require('../models/Persona');
const { generatePersonas, createBulkPersonas } = require('../controllers/personaController');
const PersonaAssignment = require('../models/PersonaAssignment');

// Define default personas
const defaultPersonas = [
  {
    name: "Investment Advisor Client",
    age: 45,
    income: "$120,000/year",
    portfolio: "$250,000 in diversified investments",
    riskTolerance: "Moderate",
    goals: "Growing wealth for retirement while managing risk",
    concerns: "Market volatility, ensuring proper diversification",
    knowledgeLevel: "Basic"
  },
  {
    name: "Early Retirement Planning Client",
    age: 35,
    income: "$150,000/year",
    portfolio: "$200,000 in 401(k)",
    riskTolerance: "Moderate",
    goals: "Achieve financial independence, retire by 50",
    concerns: "Having enough savings, healthcare costs before Medicare",
    knowledgeLevel: "Intermediate"
  },
  {
    name: "Estate Planning Client",
    age: 60,
    income: "Net Worth: $2.5 million",
    portfolio: "Mix of real estate, investments, and business interests",
    riskTolerance: "Low",
    goals: "Efficient wealth transfer, minimizing tax impact",
    concerns: "Fair distribution among children, tax implications",
    knowledgeLevel: "Basic"
  }
];

// Get all personas
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      // Admins see all personas
      const personas = await Persona.find({ isActive: true });
      return res.json(personas);
    }

    // For trainees, only return assigned personas
    const assignments = await PersonaAssignment.find({ 
      userId: req.user._id,
      status: 'active'
    }).populate('personaId');

    // Extract the personas from assignments and filter out any null values
    const personas = assignments
      .map(assignment => assignment.personaId)
      .filter(persona => persona);
    
    console.log(`Fetching personas for trainee ${req.user._id}, found ${personas.length} assigned personas`);
    res.json(personas);
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({ message: 'Failed to fetch personas' });
  }
});

// Generate new personas using OpenAI
router.post('/generate', protect, async (req, res) => {
  try {
    await generatePersonas(req, res);
  } catch (error) {
    console.error('Persona generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate personas',
      error: error.message 
    });
  }
});

// Create bulk personas
router.post('/bulk', protect, createBulkPersonas);

// Create new persona
router.post('/', protect, async (req, res) => {
  try {
    console.log('Received persona data:', req.body);
    
    // Count existing personas with the same base name
    const existingCount = await Persona.count({
      name: new RegExp(`^${req.body.name}( \\d+)?$`) // Matches "name" or "name N"
    });

    // Modify name if duplicates exist
    const finalName = existingCount > 0 ? `${req.body.name} ${existingCount}` : req.body.name;

    const persona = new Persona({
      ...req.body,
      name: finalName,
      createdBy: req.user._id
    });
    
    console.log('Created persona instance:', persona);
    
    const savedPersona = await persona.save();
    console.log('Saved persona:', savedPersona);
    
    res.status(201).json(savedPersona);
  } catch (error) {
    console.error('Error creating persona:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update persona
router.put('/:id', protect, async (req, res) => {
  try {
    const persona = await Persona.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!persona) {
      return res.status(404).json({ message: 'Persona not found' });
    }
    
    res.json(persona);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete persona (soft delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const persona = await Persona.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!persona) {
      return res.status(404).json({ message: 'Persona not found' });
    }
    
    res.json({ message: 'Persona deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reset database and seed with default personas (admin only)
router.post('/reset', protect, requireAdmin, async (req, res) => {
  try {
    // First, delete all existing personas
    await Persona.deleteMany({});
    
    // Then create the default personas
    const personas = await Persona.insertMany(
      defaultPersonas.map(persona => ({
        ...persona,
        createdBy: req.user._id,
        isActive: true
      }))
    );
    
    res.status(200).json({ 
      message: 'Database reset successful',
      personas 
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ message: 'Failed to reset database' });
  }
});

// Get persona by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const persona = await Persona.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!persona) {
      return res.status(404).json({ message: 'Persona not found' });
    }

    res.json(persona);
  } catch (error) {
    console.error('Error fetching persona:', error);
    res.status(500).json({ message: 'Error fetching persona' });
  }
});

// Search personas
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;
    const personas = await Persona.find({
      isActive: true,
      $or: [
        { name: new RegExp(query, 'i') },
        { goals: new RegExp(query, 'i') },
        { concerns: new RegExp(query, 'i') }
      ]
    });
    res.json(personas);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching personas' });
  }
});


// Export router
module.exports = router;