// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateGuestCode } = require('../middleware/guestMiddleware');
const { 
  handleChat, 
  evaluateChat, 
  getMentorSuggestions 
} = require('../controllers/chatController');

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log('Chat request:', {
    type: req.body.type,
    hasHistory: !!req.body.conversationHistory,
    messageLength: req.body.message?.length,
    headers: req.headers
  });
  next();
};

// Combined middleware that checks for either auth token or guest code
const authOrGuest = (req, res, next) => {
  const guestCode = req.headers.guestcode;
  if (guestCode) {
    return validateGuestCode(req, res, next);
  }
  return protect(req, res, next);
};

// Apply debug middleware to all routes
router.use(debugMiddleware);

// Chat routes
router.post('/', authOrGuest, handleChat);

// Evaluation route
router.post('/evaluate', authOrGuest, evaluateChat);

// Mentor suggestions route
router.post('/mentor', authOrGuest, getMentorSuggestions);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Chat route error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Invalid request data',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Authentication required',
      error: 'Invalid or missing token'
    });
  }

  // Generic error response
  res.status(500).json({
    message: err.message || 'Internal server error',
    // Include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = router;