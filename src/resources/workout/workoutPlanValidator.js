const Joi = require('joi');

const workoutPlanValidator = {
    create: Joi.object({
        clientId: Joi.string().length(24).required(),
        day: Joi.string().required(),
        date: Joi.date().required(),
        period: Joi.string().valid('Weekly', 'Monthly', 'Daily').required(),
        primaryFocus: Joi.string().when('exercises', {
            is: Joi.array().min(1).required(),
            then: Joi.required(),
            otherwise: Joi.forbidden(), // Primary focus is required only when there are exercises
        }),
        intensity: Joi.string().when('exercises', {
            is: Joi.array().min(1).required(),
            then: Joi.required(),
            otherwise: Joi.forbidden(), // Intensity is required only for workout plans
        }),
        duration: Joi.number().when('exercises', {
            is: Joi.array().min(1).required(),
            then: Joi.required(),
            otherwise: Joi.forbidden(), // Duration is required only for workout plans
        }),
        sets: Joi.number().when('exercises', {
            is: Joi.array().min(1).required(),
            then: Joi.required(),
            otherwise: Joi.forbidden(), // Sets are required only for workout plans
        }),
        reps: Joi.number().when('exercises', {
            is: Joi.array().min(1).required(),
            then: Joi.required(),
            otherwise: Joi.forbidden(), // Reps are required only for workout plans
        }),
        exercises: Joi.array().items(
            Joi.object({
                exerciseId: Joi.string().length(24).required(),
            })
        ).min(1).optional(), // Exercises are optional but should contain at least one if provided
        meals: Joi.array().items(
            Joi.object({
                mealId: Joi.string().length(24).required(),
            })
        ).min(1).optional(), // Meals are optional but should contain at least one if provided
        createdBy: Joi.string().length(24).required(),
    }).xor('exercises', 'meals') // At least one of the fields (exercises or meals) must be provided, but not both
        .messages({
            'object.xor': 'You can either provide a workout plan (exercises) or a meal plan (meals), but not both.',
        }),

    update: Joi.object({
        day: Joi.string().optional(),
        date: Joi.date().optional(),
        period: Joi.string().valid('Weekly', 'Monthly', 'Daily').optional(),
        primaryFocus: Joi.string().optional(),
        intensity: Joi.string().optional(),
        duration: Joi.number().optional(),
        sets: Joi.number().optional(),
        reps: Joi.number().optional(),
        exercises: Joi.array().items(
            Joi.object({
                exerciseId: Joi.string().length(24).required(),
            })
        ).optional(),
        meals: Joi.array().items(
            Joi.object({
                mealId: Joi.string().length(24).required(),
            })
        ).optional(),
    }),

    getById: Joi.object({
        id: Joi.string().length(24).required(),
    }),
};

module.exports = workoutPlanValidator;
