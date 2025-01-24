// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Increase EventEmitter max listeners
require('events').EventEmitter.defaultMaxListeners = 15;

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Import Routes
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
const guestRoutes = require('./routes/guestRoutes');
const adminGuestRoutes = require('./routes/adminGuestRoutes');

// =======================
// Middleware Configuration
// =======================

// Enable CORS with specific origin and credentials
app.use(cors({
  origin: 'http://localhost:5173', // Update this to your frontend URL
  credentials: true
}));

// Parse incoming JSON requests
app.use(express.json({ limit: '10mb' })); // Increased payload limit

// HTTP request logger middleware (useful for debugging)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// =======================
// Environment Variable Checks
// =======================

// List of required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'OPENAI_API_KEY'];

// Verify that each required environment variable is set
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in environment variables`);
    process.exit(1); // Exit the application with failure
  }
});

// =======================
// Database Connection
// =======================

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit the application with failure
  });

// =======================
// API Routes
// =======================

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

// =======================
// Health Check Endpoint
// =======================

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// =======================
// Error Handling Middleware
// =======================

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({ 
    message: 'Resource not found',
    path: req.originalUrl 
  });
});

// General Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🔴 Error Stack:', err.stack);
  
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
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    // Include request details in development
    request: process.env.NODE_ENV === 'development' ? {
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query
    } : undefined
  });
});

// =======================
// Start the Server
// =======================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`
🚀 Server is running on port ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'production'}
📑 API Documentation: http://localhost:${PORT}/api/health
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Exit the process in production, log only in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Always exit on uncaught exceptions
  process.exit(1);
});