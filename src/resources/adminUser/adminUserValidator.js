const Joi = require('joi');

const adminUserValidator = {
  create: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string(),
    role: Joi.string().required(),
    mobile: Joi.string(),
  }),
  update: Joi.object({
    userId: Joi.string().length(24).required(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().optional().allow(null),
    role: Joi.string().required(),
    mobile: Joi.string(),
  }),
  getById: Joi.object({
    id: Joi.string().length(24).required(),
  }),
  updateStatus: Joi.object({
    isActive: Joi.boolean().required(),
    id: Joi.string().required(),
  }),
};

module.exports = adminUserValidator;
