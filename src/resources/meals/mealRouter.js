const express = require('express');
const mealController = require('./mealController');
const mealRouter = express.Router();

mealRouter
    .route('/')
    .post(mealController.createMealWithRecipes)
    .get(mealController.getAllMeals);

mealRouter
    .route('/:id')
    .get(mealController.getMealById)
    .put(mealController.updateMeal)
    .delete(mealController.deleteMeal);
mealRouter.post('/mealWithRecipes', mealController.createMealWithRecipes);

mealRouter.patch('/:mealId', mealController.updateMealAndRecipes);

module.exports = mealRouter;
