const Joi = require('joi');

const exerciseValidator = {
    create: Joi.object({
        name: Joi.string().required(),
        primaryFocus: Joi.string().valid('Upper Body', 'Lower Body', 'Core', 'Full Body', 'Cardio').required(),
        movementPattern: Joi.string().required(),
        equipment: Joi.string().optional(),
        intensity: Joi.string().required(), // Added intensity as a required field
        duration: Joi.number().required(), // Added duration as a required field
        sets: Joi.number().required(), // Added sets as a required field
        reps: Joi.number().required(), // Added reps as a required field
        videoLink: Joi.string().uri().optional(),
        steps: Joi.array().items(
            Joi.object({
                stepNumber: Joi.number().required(),
                instruction: Joi.string().required(),
            })
        ).min(1).required(),
        picture: Joi.string().optional(),
    }),

    update: Joi.object({
        name: Joi.string().optional(),
        primaryFocus: Joi.string().valid('Upper Body', 'Lower Body', 'Core', 'Full Body', 'Cardio').optional(),
        movementPattern: Joi.string().optional(),
        equipment: Joi.string().optional(),
        intensity: Joi.string().optional(), // Optional for updates
        duration: Joi.number().optional(), // Optional for updates
        sets: Joi.number().optional(), // Optional for updates
        reps: Joi.number().optional(), // Optional for updates
        videoLink: Joi.string().uri().optional(),
        steps: Joi.array().items(
            Joi.object({
                stepNumber: Joi.number().required(),
                instruction: Joi.string().required(),
            })
        ).min(1).optional(),
        picture: Joi.string().optional(),
    }),

    getById: Joi.object({
        id: Joi.string().length(24).required(),
    }),
};

module.exports = exerciseValidator;
