// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const app = require('./app'); // Import the app from app.js

// Increase EventEmitter max listeners
require('events').EventEmitter.defaultMaxListeners = 15;

// Load environment variables from .env file
dotenv.config();

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
// Start the Server
// =======================

const PORT = process.env.PORT || 5001;

// The server is started in app.js after MongoDB connection
// This file is kept for compatibility and environment checks

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