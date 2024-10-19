const mealModel = require('./mealModel');
const Recipe = require('../recipe/recipeModel')
const mongoose = require('mongoose');
const mealServices = {
    getMealWithRecipes: async (mealId) => {
        try {
            const result = await mealModel.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(mealId) } // Match the specific meal by ID
                },
                {
                    $lookup: {
                        from: 'recipes',
                        localField: '_id',
                        foreignField: 'mealId',
                        as: 'recipes'
                    }
                }
            ]);

            return result;
        } catch (error) {
            console.error("Error fetching meal with recipes:", error);
            throw error;
        }
    },
    updateMealAndRecipes: async (mealId, mealData, recipeIds) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const meal = await mealModel.findById(mealId).session(session);
            if (!meal) {
                throw new Error('Meal not found');
            }

            if (mealData.mealName) meal.mealName = mealData.mealName;
            if (mealData.mealType) meal.mealType = mealData.mealType;

            if (recipeIds && recipeIds.length > 0) {
                const recipes = await Recipe.find({ _id: { $in: recipeIds } }).session(session);
                if (recipes.length !== recipeIds.length) {
                    throw new Error('One or more recipe IDs are invalid');
                }

                await Recipe.updateMany(
                    { _id: { $in: recipeIds } },
                    { mealId: meal._id },
                    { session }
                );
            }

            await meal.save({ session });

            await session.commitTransaction();
            session.endSession();

            return meal;

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    },

    createMealWithRecipes: async (mealData, recipesData) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const meal = new mealModel(mealData);
            await meal.save({ session });

            const recipes = await Recipe.insertMany(
                recipesData.map(recipe => ({
                    ...recipe,
                    mealId: meal._id,
                })),
                { session }
            );

            meal.totalCalories = recipes.reduce((sum, recipe) => sum + recipe.calories, 0);
            meal.totalProtein = recipes.reduce((sum, recipe) => sum + recipe.protein, 0);
            meal.totalFats = recipes.reduce((sum, recipe) => sum + recipe.fats, 0);
            meal.totalCarbs = recipes.reduce((sum, recipe) => sum + recipe.carbs, 0);
            meal.totalMeals = recipes.length;


            await meal.save({ session });

            await session.commitTransaction();
            session.endSession();

            return { meal, recipes };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    ,
    createMealWithPreExistingRecipes: async (mealData, recipeIds) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            const recipes = await Recipe.find({ _id: { $in: recipeIds } }).session(session);
            if (recipes.length !== recipeIds.length) {
                throw new Error('One or more recipe IDs are invalid');
            }


            const meal = new mealModel(mealData);
            await meal.save({ session });

            await Recipe.updateMany(
                { _id: { $in: recipeIds } },
                { mealId: meal._id },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            return { meal, recipes };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    },
    create: async (data) => {
        return await mealModel.create(data);
    },
    update: async (id, data) => {
        return await mealModel.findOneAndUpdate({ _id: id }, data, { new: true });
    },
    getAll: async () => {
        return await mealModel.aggregate([
            {
                $lookup: {
                    from: 'recipes',
                    localField: '_id',
                    foreignField: 'mealId',
                    as: 'recipes'
                }
            },
            {
                $project: {
                    mealName: 1,
                    mealType: 1,
                    totalCalories: 1,
                    totalProtein: 1,
                    totalFats: 1,
                    totalCarbs: 1,
                    totalMeals: 1,
                    recipes: {
                        recipeName: 1,
                        calories: 1,
                        protein: 1,
                        fats: 1,
                        carbs: 1,
                        ingredients: 1,
                        steps: 1,
                        description: 1,
                        recipeImage: 1
                    }
                }
            }
        ]);
    },
    getById: async (id) => {
        return await mealModel.findById(id);
    },
    deleteMeal: async (id) => {
        return await mealModel.findByIdAndDelete(id);
    },
};

module.exports = mealServices;
