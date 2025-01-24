// routes/personaAssignmentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const {
  assignPersona,
  getUserAssignments,
  updateAssignment,
  deleteAssignment
} = require('../controllers/personaAssignmentController');

// Apply authentication middleware to all routes
router.use(protect);

// Admin-only routes
router.post('/', requireAdmin, assignPersona);
router.put('/:id', requireAdmin, updateAssignment);
router.delete('/:id', requireAdmin, deleteAssignment);

// Routes accessible by all authenticated users
router.get('/user/:userId', getUserAssignments);

module.exports = router;