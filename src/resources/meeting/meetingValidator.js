// validators/meetingValidator.js
const Joi = require('joi');

const meetingValidator = {
    // Validator for creating a meeting
    create: Joi.object({
        clientId: Joi.string().length(24).required(),
        adminId: Joi.string().length(24).required(),
        meetingDate: Joi.date().iso().required(), // Assuming meetingDate should be in ISO format
        meetingTime: Joi.string().required(), // Assuming meetingTime is a string, you might want to refine this
        notes: Joi.string().optional(), // Notes can be optional
    }),

    // Validator for getting meetings by client ID
    getByClient: Joi.object({
        clientId: Joi.string().length(24).required(),
    }),

    // Validator for getting meetings by admin ID
    getByAdmin: Joi.object({
        adminId: Joi.string().length(24).required(),
    }),

    // Validator for updating meeting status
    updateStatus: Joi.object({
        status: Joi.string().valid('scheduled', 'completed', 'canceled').required(), // Define your valid statuses
    }),

    // Validator for deleting a meeting
    delete: Joi.object({
        meetingId: Joi.string().length(24).required(),
    }),
};

module.exports = meetingValidator;
