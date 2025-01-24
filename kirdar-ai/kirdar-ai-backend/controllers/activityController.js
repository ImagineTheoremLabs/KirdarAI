// controllers/activityController.js
const UserActivity = require('../models/UserActivity');
const mongoose = require('mongoose');

// @desc    Get user activities and stats
// @route   GET /api/user/activity
// @access  Private
const getUserActivity = async (req, res) => {
  try {
    // Get recent activities
    const activities = await UserActivity.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate stats
    const stats = await calculateUserStats(req.user.id);

    // Return formatted response
    res.json({
      activities: activities.map(activity => formatActivity(activity)),
      stats
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Error fetching activity data' });
  }
};

// @desc    Log new activity
// @route   POST /api/user/activity
// @access  Private
const logActivity = async (req, res) => {
  try {
    const { type, description, metadata } = req.body;

    // Validate required fields
    if (!type || !description) {
      return res.status(400).json({ message: 'Type and description are required' });
    }

    // Create new activity
    const activity = await UserActivity.create({
      userId: req.user.id,
      type,
      description,
      metadata,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Return formatted activity
    res.status(201).json(formatActivity(activity));
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ message: 'Error logging activity' });
  }
};

// @desc    Get specific activity
// @route   GET /api/user/activity/:id
// @access  Private
const getActivityById = async (req, res) => {
  try {
    const activity = await UserActivity.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(formatActivity(activity));
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Error fetching activity' });
  }
};

// @desc    Delete specific activity
// @route   DELETE /api/user/activity/:id
// @access  Private
const deleteActivity = async (req, res) => {
  try {
    const activity = await UserActivity.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await activity.remove();
    res.json({ message: 'Activity removed' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Error deleting activity' });
  }
};

// @desc    Clear all user activities
// @route   DELETE /api/user/activity/clear
// @access  Private
const clearActivities = async (req, res) => {
  try {
    await UserActivity.deleteMany({ userId: req.user.id });
    res.json({ message: 'All activities cleared' });
  } catch (error) {
    console.error('Error clearing activities:', error);
    res.status(500).json({ message: 'Error clearing activities' });
  }
};

// Helper function to calculate user statistics
const calculateUserStats = async (userId) => {
  try {
    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    // Scenarios completed
    const scenariosCompleted = await UserActivity.countDocuments({
      userId: userIdObj,
      type: 'scenario_complete'
    });

    // Calculate practice hours
    const practiceHoursResult = await UserActivity.aggregate([
      {
        $match: {
          userId: userIdObj,
          'metadata.duration': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$metadata.duration' }
        }
      }
    ]);

    // Calculate average score
    const scoresResult = await UserActivity.aggregate([
      {
        $match: {
          userId: userIdObj,
          'metadata.score': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$metadata.score' }
        }
      }
    ]);

    // Calculate weekly activities
    const weeklyActivities = await UserActivity.countDocuments({
      userId: userIdObj,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Calculate assessments completed
    const assessmentsCompleted = await UserActivity.countDocuments({
      userId: userIdObj,
      type: 'assessment_complete'
    });

    // Calculate total activities
    const totalActivities = await UserActivity.countDocuments({
      userId: userIdObj
    });

    // Determine progress level
    let progressLevel = 'Beginner';
    if (scenariosCompleted >= 15) progressLevel = 'Advanced';
    else if (scenariosCompleted >= 5) progressLevel = 'Intermediate';

    // Weekly progress percentage change
    const previousWeekActivities = await UserActivity.countDocuments({
      userId: userIdObj,
      createdAt: {
        $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });

    const weeklyProgressChange = previousWeekActivities === 0 
      ? 100 
      : Math.round(((weeklyActivities - previousWeekActivities) / previousWeekActivities) * 100);

    return {
      scenariosCompleted,
      practiceHours: Math.round((practiceHoursResult[0]?.totalMinutes || 0) / 60),
      averageScore: Math.round(scoresResult[0]?.averageScore || 0),
      progressLevel,
      weeklyProgress: weeklyActivities,
      weeklyProgressChange,
      totalActivities,
      assessmentsCompleted,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    throw error;
  }
};

// Helper function to format activity data
const formatActivity = (activity) => {
  return {
    id: activity._id,
    type: activity.type,
    title: getActivityTitle(activity.type),
    description: activity.description,
    date: activity.createdAt,
    duration: activity.metadata?.duration,
    score: activity.metadata?.score,
    metadata: activity.metadata
  };
};

// Helper function to get activity title
const getActivityTitle = (type) => {
  const titles = {
    'login': 'Logged In',
    'logout': 'Logged Out',
    'profile_update': 'Updated Profile',
    'password_change': 'Changed Password',
    'scenario_complete': 'Completed Scenario',
    'assessment_complete': 'Completed Assessment',
    'settings_update': 'Updated Settings',
    'persona_interaction': 'Client Interaction'
  };
  return titles[type] || 'Activity';
};

// Export all controller functions
module.exports = {
  getUserActivity,
  logActivity,
  getActivityById,
  deleteActivity,
  clearActivities
};