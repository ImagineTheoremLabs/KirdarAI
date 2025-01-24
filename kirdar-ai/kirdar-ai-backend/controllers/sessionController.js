// controllers/sessionController.js
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

const getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user.id,
      isActive: true
    }).sort({ lastActive: -1 });

    // Format sessions for client
    const formattedSessions = sessions.map(session => {
      const parser = new UAParser(session.userAgent);
      const device = parser.getDevice();
      const browser = parser.getBrowser();
      const os = parser.getOS();

      return {
        id: session._id,
        deviceType: device.type || 'desktop',
        deviceName: `${os.name || 'Unknown OS'} - ${browser.name || 'Unknown Browser'}`,
        location: session.location,
        lastActive: session.lastActive,
        current: session.token === req.token,
        ip: session.ip
      };
    });

    res.json(formattedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Error fetching active sessions' });
  }
};

const createSession = async (req, userId, token) => {
  try {
    const parser = new UAParser(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    
    const session = new Session({
      userId,
      token,
      userAgent: req.headers['user-agent'],
      ip: ip,
      location: geo ? `${geo.city}, ${geo.country}` : 'Unknown',
      lastActive: new Date(),
      isActive: true
    });

    await session.save();
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

const revokeSession = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user.id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Don't allow revoking current session
    if (session.token === req.token) {
      return res.status(400).json({ message: 'Cannot revoke current session' });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ message: 'Error revoking session' });
  }
};

const revokeAllSessions = async (req, res) => {
  try {
    // Revoke all sessions except current one
    await Session.updateMany(
      { 
        userId: req.user.id,
        isActive: true,
        token: { $ne: req.token }
      },
      { 
        $set: { isActive: false }
      }
    );

    res.json({ message: 'All other sessions revoked successfully' });
  } catch (error) {
    console.error('Error revoking all sessions:', error);
    res.status(500).json({ message: 'Error revoking sessions' });
  }
};

const updateSessionActivity = async (req, userId, token) => {
  try {
    await Session.findOneAndUpdate(
      { userId, token },
      { lastActive: new Date() }
    );
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
};

module.exports = {
  getActiveSessions,
  createSession,
  revokeSession,
  revokeAllSessions,
  updateSessionActivity
};