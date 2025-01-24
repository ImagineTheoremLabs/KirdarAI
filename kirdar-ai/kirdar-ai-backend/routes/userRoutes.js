// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  saveQuestionnaire, 
  getUserProgress, 
  updateScenarioProgress 
} = require('../controllers/userController');
const { 
  getUserActivity, 
  logActivity, 
  clearActivities 
} = require('../controllers/activityController');
const {
  getPreferences,
  updatePreferences,
  getNotificationSettings,
  updateNotificationSettings,
  getSecuritySettings,
  updateSecuritySettings
} = require('../controllers/preferencesController');

// Questionnaire and Progress Routes
router.post('/questionnaire', protect, saveQuestionnaire);
router.get('/progress', protect, getUserProgress);
router.post('/progress/scenario', protect, updateScenarioProgress);

// Activity Routes
router.get('/activity', protect, getUserActivity);
router.post('/activity', protect, logActivity);
router.delete('/activity/clear', protect, clearActivities);

// Preferences Routes
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);

// Notification Settings Routes
router.get('/preferences/notifications', protect, getNotificationSettings);
router.put('/preferences/notifications', protect, updateNotificationSettings);

// Security Settings Routes
router.get('/preferences/security', protect, getSecuritySettings);
router.put('/preferences/security', protect, updateSecuritySettings);

// Progress Tracking Routes
router.post('/track/scenario-start', protect, async (req, res) => {
  try {
    await logActivity({
      userId: req.user.id,
      type: 'scenario_start',
      description: 'Started new scenario',
      metadata: { scenarioId: req.body.scenarioId }
    });
    res.json({ message: 'Scenario start tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking scenario start' });
  }
});

router.post('/track/scenario-complete', protect, async (req, res) => {
  try {
    await logActivity({
      userId: req.user.id,
      type: 'scenario_complete',
      description: 'Completed scenario',
      metadata: {
        scenarioId: req.body.scenarioId,
        score: req.body.score,
        duration: req.body.duration
      }
    });
    res.json({ message: 'Scenario completion tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking scenario completion' });
  }
});

router.post('/track/assessment-complete', protect, async (req, res) => {
  try {
    await logActivity({
      userId: req.user.id,
      type: 'assessment_complete',
      description: 'Completed assessment',
      metadata: {
        assessmentId: req.body.assessmentId,
        score: req.body.score,
        duration: req.body.duration
      }
    });
    res.json({ message: 'Assessment completion tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking assessment completion' });
  }
});

// User Stats Routes
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await UserActivity.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalScenarios: {
            $sum: { $cond: [{ $eq: ['$type', 'scenario_complete'] }, 1, 0] }
          },
          totalAssessments: {
            $sum: { $cond: [{ $eq: ['$type', 'assessment_complete'] }, 1, 0] }
          },
          avgScore: { $avg: '$metadata.score' },
          totalDuration: { $sum: '$metadata.duration' }
        }
      }
    ]);

    res.json({
      stats: stats[0] || {
        totalScenarios: 0,
        totalAssessments: 0,
        avgScore: 0,
        totalDuration: 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats' });
  }
});

// Development Routes (only available in development environment)
if (process.env.NODE_ENV === 'development') {
  router.delete('/reset-data', protect, async (req, res) => {
    try {
      await UserActivity.deleteMany({ userId: req.user.id });
      await UserPreference.findOneAndUpdate(
        { userId: req.user.id },
        { $set: { lastReset: new Date() } },
        { upsert: true }
      );
      res.json({ message: 'User data reset successful' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting user data' });
    }
  });
}

module.exports = router;