// routes/adminGuestRoutes.js
const express = require('express');
const router = express.Router();
const AdminGuestController = require('../controllers/adminGuestController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Apply protection to all routes
router.use(protect);
router.use(requireAdmin);

// Guest code management routes
router.post('/codes/generate', AdminGuestController.generateCode);
router.get('/codes', AdminGuestController.getCodes);
router.put('/codes/:codeId/assignments', AdminGuestController.updateAssignments);
router.delete('/codes/:codeId', AdminGuestController.deactivateCode);

module.exports = router;