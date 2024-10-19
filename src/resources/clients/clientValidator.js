const Joi = require('joi');

const clientValidator = {
    create: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
        status: Joi.boolean().optional(),
        address: Joi.string().optional().allow(""),
        phone: Joi.string().optional().allow(""),
        profilePicture: Joi.string().optional().allow(""),
        createdBy: Joi.string().length(24).optional().allow(""),
    }),
    update: Joi.object({
        clientId: Joi.string().length(24).required(),
        name: Joi.string().optional(),
        email: Joi.string().email().optional(),
        password: Joi.string().optional(),
        gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
        status: Joi.boolean().optional(),
        address: Joi.string().optional().allow(""),
        phone: Joi.string().optional().allow(""),
        profilePicture: Joi.string().optional().allow(""),
    }),
    getById: Joi.object({
        id: Joi.string().length(24).required(),
    }),
};

module.exports = clientValidator;
