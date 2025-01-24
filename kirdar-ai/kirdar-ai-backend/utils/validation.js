// utils/validation.js
const Joi = require('joi');

const validatePreferences = (data) => {
  const schema = Joi.object({
    emailNotifications: Joi.boolean().optional(),
    securityAlerts: Joi.boolean().optional(),
    marketingEmails: Joi.boolean().optional(),
    darkMode: Joi.boolean().optional(),
    autoSession: Joi.boolean().optional(),
    sessionTimeout: Joi.number().min(5).max(1440).optional(),
    twoFactorEnabled: Joi.boolean().optional(),
    language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt').optional(),
    timezone: Joi.string().optional()
  });

  return schema.validate(data);
};

const validateSession = (data) => {
  const schema = Joi.object({
    userAgent: Joi.string().required(),
    ip: Joi.string().required(),
    location: Joi.string().optional()
  });

  return schema.validate(data);
};

const validateUpdateProfile = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    currentPassword: Joi.string().min(6).when('newPassword', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    newPassword: Joi.string().min(6).optional()
  });

  return schema.validate(data);
};

module.exports = {
  validatePreferences,
  validateSession,
  validateUpdateProfile
};