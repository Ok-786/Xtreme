const Joi = require('joi');

const dailyWellnessValidator = {
    create: (req, res, next) => {
        const schema = Joi.object({
            clientId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/), // Ensure valid ObjectId format
            hydrationLevel: Joi.string().optional(),
            stepsCount: Joi.string().optional(),
            sleepQuality: Joi.string().optional(),
            energyLevel: Joi.string().optional(),
            restingHeartRate: Joi.string().optional(),
            completedWorkout: Joi.string().optional(),
            completedMeal: Joi.string().optional(),
            mentalClarity: Joi.string().optional(),
            metabolism: Joi.string().optional(),
            skin: Joi.string().optional(),
            workouts: Joi.string().optional(),
            calories: Joi.string().optional(),
            glasses: Joi.string().optional()
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },

    update: (req, res, next) => {
        const schema = Joi.object({
            hydrationLevel: Joi.string().optional(),
            stepsCount: Joi.string().optional(),
            sleepQuality: Joi.string().optional(),
            energyLevel: Joi.string().optional(),
            restingHeartRate: Joi.string().optional(),
            completedWorkout: Joi.string().optional(),
            completedMeal: Joi.string().optional(),
            mentalClarity: Joi.string().optional(),
            metabolism: Joi.string().optional(),
            skin: Joi.string().optional(),
            workouts: Joi.string().optional(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },

    idParam: (req, res, next) => {
        const schema = Joi.object({
            id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/), // Ensure valid ObjectId format
        });
        const { error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    },
};

module.exports = dailyWellnessValidator;
