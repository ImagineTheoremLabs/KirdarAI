// controllers/preferencesController.js
const UserPreference = require('../models/UserPreference');
const { validatePreferences } = require('../utils/validation');

const getPreferences = async (req, res) => {
  try {
    let preferences = await UserPreference.findOne({ userId: req.user.id });
    
    if (!preferences) {
      // Create default preferences if none exist
      preferences = await UserPreference.create({
        userId: req.user.id,
        emailNotifications: true,
        securityAlerts: true,
        marketingEmails: false,
        darkMode: true,
        autoSession: true,
        sessionTimeout: 30, // 30 minutes
        language: 'en',
        timezone: 'UTC'
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Error fetching user preferences' });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const { error } = validatePreferences(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const preferences = await UserPreference.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, upsert: true }
    );

    res.json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Error updating user preferences' });
  }
};

const getNotificationSettings = async (req, res) => {
  try {
    const preferences = await UserPreference.findOne({ userId: req.user.id })
      .select('emailNotifications securityAlerts marketingEmails');
    
    if (!preferences) {
      return res.status(404).json({ message: 'Notification settings not found' });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ message: 'Error fetching notification settings' });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {
    const { emailNotifications, securityAlerts, marketingEmails } = req.body;

    const preferences = await UserPreference.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          emailNotifications,
          securityAlerts,
          marketingEmails
        }
      },
      { new: true, upsert: true }
    );

    res.json(preferences);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Error updating notification settings' });
  }
};

const getSecuritySettings = async (req, res) => {
  try {
    const preferences = await UserPreference.findOne({ userId: req.user.id })
      .select('autoSession sessionTimeout twoFactorEnabled');
    
    if (!preferences) {
      return res.status(404).json({ message: 'Security settings not found' });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({ message: 'Error fetching security settings' });
  }
};

const updateSecuritySettings = async (req, res) => {
  try {
    const { autoSession, sessionTimeout, twoFactorEnabled } = req.body;

    const preferences = await UserPreference.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          autoSession,
          sessionTimeout,
          twoFactorEnabled
        }
      },
      { new: true, upsert: true }
    );

    res.json(preferences);
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ message: 'Error updating security settings' });
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  getNotificationSettings,
  updateNotificationSettings,
  getSecuritySettings,
  updateSecuritySettings
};