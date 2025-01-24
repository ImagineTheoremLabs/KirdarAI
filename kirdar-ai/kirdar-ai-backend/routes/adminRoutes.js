// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { 
  generateTrainingCode, 
  getTrainees, 
  getTrainingCodes, 
  deleteCode, 
  assignContent, 
  getDashboardStats 
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Apply protection to all routes
router.use(protect);
router.use(requireAdmin);

// Training code management
router.post('/codes/generate', generateTrainingCode);
router.get('/codes', getTrainingCodes);
router.delete('/codes/:codeId', deleteCode); 

// Trainee management
router.get('/trainees', getTrainees);
router.post('/trainees/assign', assignContent);

// Dashboard
router.get('/dashboard', getDashboardStats);

module.exports = router;