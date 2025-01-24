// controllers/userController.js
const User = require('../models/User');
const Progress = require('../models/Progress');

// @desc    Save questionnaire responses
// @route   POST /api/user/questionnaire
const saveQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;
    const responses = req.body;

    await Progress.findOneAndUpdate(
      { userId },
      { 
        questionnaireResponses: responses,
        $set: { 'user.questionnaireDone': true }
      },
      { upsert: true }
    );

    res.json({ message: 'Questionnaire responses saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user progress
// @route   GET /api/user/progress
const getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update scenario progress
// @route   POST /api/user/progress/scenario
const updateScenarioProgress = async (req, res) => {
  try {
    const { scenarioId, score, feedback } = req.body;
    const userId = req.user.id;

    const progress = await Progress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    progress.completedScenarios.push({
      scenarioId,
      completedAt: new Date(),
      score,
      feedback
    });

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  saveQuestionnaire,
  getUserProgress,
  updateScenarioProgress,
};