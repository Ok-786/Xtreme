const Joi = require('joi');

const recipeValidator = {
    create: Joi.object({
        recipeName: Joi.string().required(),
        calories: Joi.number().required(),
        protein: Joi.number().required(),
        fats: Joi.number().required(),
        carbs: Joi.number().required(),
        ingredients: Joi.array().items(
            Joi.object({
                ingredientName: Joi.string().required(),
                quantity: Joi.string().required(), // e.g., "200g", "2 cups"
            })
        ).min(1).required(),
        steps: Joi.array().items(
            Joi.object({
                stepNumber: Joi.number().required(),
                instruction: Joi.string().required(),
            })
        ).min(1).required(),
        description: Joi.string().required(),
        recipeImage: Joi.string().optional(), // Optional image URL/path
        mealId: Joi.string().length(24).optional(), // Mongoose ObjectId validation
    }),

    update: Joi.object({
        recipeName: Joi.string().optional(),
        calories: Joi.number().optional(),
        protein: Joi.number().optional(),
        fats: Joi.number().optional(),
        carbs: Joi.number().optional(),
        ingredients: Joi.array().items(
            Joi.object({
                ingredientName: Joi.string().optional(),
                quantity: Joi.string().optional(),
            })
        ).optional(),
        steps: Joi.array().items(
            Joi.object({
                stepNumber: Joi.number().optional(),
                instruction: Joi.string().optional(),
            })
        ).optional(),
        description: Joi.string().optional(),
        recipeImage: Joi.string().optional(),
        mealId: Joi.string().length(24).optional(), // Mongoose ObjectId validation
    }),

    getById: Joi.object({
        id: Joi.string().length(24).required(),
    }),
};

module.exports = recipeValidator;
