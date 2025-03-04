// routes/guestRoutes.js
const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const { validateGuestCode } = require('../middleware/guestMiddleware');
const { evaluateChat, getMentorSuggestions } = require('../controllers/chatController');

// Guest code validation
router.post('/validate-code', guestController.validateCode);

// Guest chat - requires guest code validation
router.post('/chat', validateGuestCode, guestController.handleChat);

// Guest chat evaluation
router.post('/chat/evaluate', validateGuestCode, evaluateChat);

// Guest mentor suggestions
router.post('/chat/mentor', validateGuestCode, getMentorSuggestions);

module.exports = router;