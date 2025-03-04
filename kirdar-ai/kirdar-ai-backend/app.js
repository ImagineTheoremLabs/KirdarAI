const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const adminGuestRoutes = require('./routes/adminGuestRoutes');
const guestRoutes = require('./routes/guestRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const personaRoutes = require('./routes/personaRoutes');
const scenarioRoutes = require('./routes/scenarioRoutes');
const chatRoutes = require('./routes/chatRoutes');
const audioRoutes = require('./routes/audioRoutes');
const handbookRoutes = require('./routes/handbookRoutes');
const adminRoutes = require('./routes/adminRoutes');
const traineeRoutes = require('./routes/traineeRoutes');
const personaAssignmentRoutes = require('./routes/personaAssignmentRoutes');
const scenarioAssignmentRoutes = require('./routes/scenarioAssignmentRoutes');

const app = express();

// Middleware
console.log('CORS configuration:', {
  frontendUrl: process.env.FRONTEND_URL,
  allowedOrigins: [process.env.FRONTEND_URL, 'http://ec2-52-1-240-73.compute-1.amazonaws.com:5173', 'http://localhost:5173']
});

// Define allowed origins - make this more dynamic to handle IP changes
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://ec2-52-1-240-73.compute-1.amazonaws.com:5173',
  'http://ec2-52-1-240-73.compute-1.amazonaws.com:5174',
  'http://ec2-52-1-240-73.compute-1.amazonaws.com:4173',
  'http://ec2-52-1-240-73.compute-1.amazonaws.com:4174',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:4174'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, origin);
    } else {
      // For more resilience, check if it's the same host but different port
      try {
        const originUrl = new URL(origin);
        const frontendUrl = process.env.FRONTEND_URL ? new URL(process.env.FRONTEND_URL) : null;
        
        // If it's the same hostname as our frontend URL, allow it
        if (frontendUrl && originUrl.hostname === frontendUrl.hostname) {
          console.log(`Allowing same-host origin: ${origin}`);
          return callback(null, origin);
        }
        
        // If it contains our EC2 domain pattern, allow it
        if (originUrl.hostname.includes('ec2-') && originUrl.hostname.includes('.compute-1.amazonaws.com')) {
          console.log(`Allowing EC2 domain: ${origin}`);
          return callback(null, origin);
        }
      } catch (error) {
        console.error('Error parsing origin URL:', error);
      }
      
      console.log(`Origin ${origin} not allowed by CORS`);
      callback(null, allowedOrigins[0]); // Default to first allowed origin
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased payload limit

// API Routes
// Auth and User Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Core Feature Routes
app.use('/api/personas', personaRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/audio', audioRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/guest', adminGuestRoutes);

// Training and Assignment Routes
app.use('/api/trainee', traineeRoutes);
app.use('/api/persona-assignments', personaAssignmentRoutes);
app.use('/api/scenario-assignments', scenarioAssignmentRoutes);

// Document and Guest Routes
app.use('/api/handbook', handbookRoutes);
app.use('/api/guest', guestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({ 
    message: 'Resource not found',
    path: req.originalUrl 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle specific types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Authentication Error',
      error: 'Invalid or expired token'
    });
  }

  // Generic error response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      const serverUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📑 API Documentation: ${serverUrl}/api/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

module.exports = app;
