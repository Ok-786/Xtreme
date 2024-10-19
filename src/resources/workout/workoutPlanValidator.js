const Joi = require('joi');

const workoutPlanValidator = {
    create: Joi.object({
        clientId: Joi.string().length(24).required(),  // Validate MongoDB ObjectId format
        day: Joi.string().required(),  // Day as a string (e.g., "Monday")
        date: Joi.date().required(),  // Date required
        period: Joi.string().valid('Weekly', 'Monthly', 'Daily').optional(),  // Enum validation
        exercises: Joi.array().items(
            Joi.object({
                exerciseId: Joi.string().length(24).required(),  // Validate exercise ObjectId
                intensity: Joi.string().required(),  // Intensity required (e.g., "Low", "Medium", "High")
                duration: Joi.number().required(),  // Duration required (in minutes)
                sets: Joi.number().required(),  // Number of sets required
                reps: Joi.number().required(),  // Number of reps required
            })
        ).min(1).required(),  // At least one exercise is required
        createdBy: Joi.string().length(24).required(),  // Validate createdBy field as ObjectId
    }),

    update: Joi.object({
        day: Joi.string().optional(),
        date: Joi.date().optional(),
        period: Joi.string().valid('Weekly', 'Monthly', 'Daily').optional(),  // Optional period field with enum validation
        exercises: Joi.array().items(
            Joi.object({
                exerciseId: Joi.string().length(24).required(),  // Validate exercise ObjectId
                intensity: Joi.string().optional(),  // Optional intensity
                duration: Joi.number().optional(),  // Optional duration
                sets: Joi.number().optional(),  // Optional sets
                reps: Joi.number().optional(),  // Optional reps
            })
        ).optional(),  // Exercises array is optional for updates
    }),

    getById: Joi.object({
        id: Joi.string().length(24).required(),  // Validate ObjectId for fetching workout plans
    }),
};

module.exports = workoutPlanValidator;
