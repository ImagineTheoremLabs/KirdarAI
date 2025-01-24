// scripts/seedActivity.js
const mongoose = require('mongoose');
const UserActivity = require('../models/UserActivity');
require('dotenv').config();

async function seedActivity(userId) {
  const activities = [
    {
      userId,
      type: 'login',
      description: 'Logged in successfully',
      metadata: { device: 'web' }
    },
    {
      userId,
      type: 'scenario_complete',
      description: 'Completed Retirement Planning Scenario',
      metadata: { score: 95, scenarioId: '1' }
    },
    {
      userId,
      type: 'assessment_complete',
      description: 'Completed Financial Knowledge Assessment',
      metadata: { score: 88 }
    }
  ];

  try {
    await UserActivity.insertMany(activities);
    console.log('Activity data seeded successfully');
  } catch (error) {
    console.error('Error seeding activity data:', error);
  }
}

// You can run this script directly to seed data for a specific user
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      // Replace with an actual user ID from your database
      seedActivity('your-user-id-here')
        .then(() => mongoose.connection.close());
    });
}

module.exports = seedActivity;