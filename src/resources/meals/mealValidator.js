const Joi = require('joi');

// Define recipeSchema before using it
const recipeSchema = Joi.object({
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
    recipeImage: Joi.string().optional(),
});

const mealValidator = {
    createMealValidator: Joi.object({
        mealName: Joi.string().required(),
        mealType: Joi.string().valid('Macro-Based', 'Calorie-Based', 'Custom').required(),
        recipes: Joi.array().items(recipeSchema).min(1).required(),
    }),
    createMealWithRecipeIdsValidator: Joi.object({
        mealName: Joi.string().required(),
        mealType: Joi.string().valid('Macro-Based', 'Calorie-Based', 'Custom').required(),
        recipeIds: Joi.array().items(Joi.string().length(24).required()).min(1).required(),
    }),
    updateMealValidator: Joi.object({
        mealName: Joi.string().optional(),
        mealType: Joi.string().valid('Macro-Based', 'Calorie-Based', 'Custom').optional(),
        recipeIds: Joi.array().items(Joi.string().length(24).optional()).min(1).optional(),
    }),
    create: Joi.object({
        mealName: Joi.string().required(),
        mealType: Joi.string().valid('Macro-Based', 'Calorie-Based', 'Custom').required(),
    }),
    update: Joi.object({
        mealName: Joi.string().optional(),
        mealType: Joi.string().valid('Macro-Based', 'Calorie-Based', 'Custom').optional(),
    }),
    getById: Joi.object({
        id: Joi.string().length(24).required(),
    }),
};

module.exports = mealValidator;
