// middleware/guestMiddleware.js
const GuestCode = require('../models/GuestCode');

// Validate guest access code middleware
const validateGuestCode = async (req, res, next) => {
  try {
    const guestCode = req.headers.guestcode;
    console.log('Received guest code:', guestCode);

    if (!guestCode) {
      return res.status(401).json({ message: 'Guest access code required' });
    }

    // Find and validate the code
    const code = await GuestCode.findOne({ 
      code: guestCode.toUpperCase(),
      status: 'active'
    });

    if (!code) {
      return res.status(401).json({ message: 'Invalid or expired guest code' });
    }

    // Attach the guest code to the request
    req.guestCode = code;
    next();
  } catch (error) {
    console.error('Guest middleware error:', error);
    res.status(500).json({ message: 'Error validating guest access' });
  }
};

module.exports = {
  validateGuestCode
};