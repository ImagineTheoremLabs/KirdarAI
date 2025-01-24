// routes/scenarioRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const {
  getScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
  resetScenarios
} = require('../controllers/scenarioController');

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log('Scenario route accessed:', {
    method: req.method,
    path: req.path,
    auth: req.headers.authorization ? 'Present' : 'Missing',
    userId: req.user?._id
  });
  next();
};

// Apply middleware to all routes
router.use(protect);
router.use(debugMiddleware);

// Routes
router.get('/', getScenarios);
router.post('/', requireAdmin, createScenario);
router.put('/:id', requireAdmin, updateScenario);
router.delete('/:id', requireAdmin, deleteScenario);
router.post('/reset', requireAdmin, resetScenarios);

module.exports = router;