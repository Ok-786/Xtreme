const asyncHandler = require('express-async-handler');
const clientMealPlanService = require('./clientMealPlanService');
const { validateClientMealPlan } = require('./clientMealPlanValidator');
const sendResponse = require('../../utils/sendResponse');
const responseStatusCodes = require('../../constants/responseStatusCodes');
const ClientMealPlan = require('./clientMealPlanModel')
const Client = require("../clients/clientModel")
const getChatGPTResponse = require('../../utils/gpt');
const NutritionAndExerciseHabits = require('../nutritionAndExercise/nutritionAndExerciseModel');
const FitnessQuestions = require('../fitnessQuestionares/fitnessQuestionaresModel');
const Demographics = require('../demographics/demographicModel');
const Meal = require('../meals/mealModel')
const Recipe = require('../recipe/recipeModel');
const mongoose = require('mongoose');
const AdminUser = require('../adminUser/adminUserModel')
const systemNotificationServices = require('../systemNotifications/systemNotification');
const notificationService = require('../notifications/notificationService')


const clientMealPlanController = {
    generateMealPlan: asyncHandler(async (req, res) => {
        const { clientId } = req.body;

        if (!clientId) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'clientId is required.'
            );
        }

        try {
            const nutritionData = await NutritionAndExerciseHabits.findOne({ clientId }).lean();
            const fitnessData = await FitnessQuestions.findOne({ clientId }).lean();
            const demographicsData = await Demographics.findOne({ clientId }).lean();

            if (!nutritionData || !fitnessData || !demographicsData) {
                return sendResponse(
                    res,
                    responseStatusCodes.BAD,
                    'Client data is incomplete or missing.'
                );
            }

            const goal = fitnessData.goals || nutritionData.motivationToGetInShape || 'general health';
            const dietaryRestrictions = nutritionData.dietaryRestrictions || 'none';
            const foodAllergies = nutritionData.foodAllergies || 'none';
            const hasMedicalConditions = fitnessData.medicalOrHealthConditions || 'none';

            let mealType = 'Balanced Plan';
            let carbRange = '40-50% of total calories';
            let calorieRange = '2000-2500 calories/day';

            if (hasMedicalConditions.includes('diabetes')) {
                mealType = 'Diabetes-Friendly Plan';
                carbRange = '40-45% of total calories';
                calorieRange = '1800-2200 calories/day';
            } else if (goal.toLowerCase().includes('weight loss')) {
                mealType = 'Weight Loss Plan';
                carbRange = '20-30% of total calories';
                calorieRange = '1200-1500 calories/day';
            } else if (goal.toLowerCase().includes('muscle gain') || goal.toLowerCase().includes('bulk')) {
                mealType = 'Muscle Gain Plan';
                carbRange = '50-60% of total calories';
                calorieRange = '2500-3000 calories/day';
            }

            const prompt = `
        Generate a JSON meal plan for a client with:
        Goal: "${goal}", Meal Type: "${mealType}", Gender: "${demographicsData.gender || 'not specified'}",
        Age: "${demographicsData.age || 'not specified'}", Height: "${demographicsData.height || 'not specified'}",
        Weight: "${demographicsData.weight || 'not specified'}", Activity level: "${fitnessData.currentPhysicalActivityLevel || 'not specified'}",
        Allergies: "${foodAllergies}", Dietary restrictions: "${dietaryRestrictions}", Medical conditions: "${hasMedicalConditions}",
        Foods to avoid: "${nutritionData.foodsToAvoid || 'none'}", Carb Range: "${carbRange}", Calorie Range: "${calorieRange}".
        5 meals/day, JSON format:
        {"meals":[{"mealName":"","calories":0,"protein":0,"fats":0,"carbs":0,"mealType":"","recipes":[{"recipeName":"","ingredients":[{"ingredientName":"","quantity":""}],"steps":[{"stepNumber":1,"instruction":""}]}]}]}
        `;

            const gptResponse = await getChatGPTResponse.getChatGPTResponse(prompt);
            const mealPlan = JSON.parse(gptResponse);

            if (!mealPlan.meals || !Array.isArray(mealPlan.meals)) {
                return sendResponse(
                    res,
                    responseStatusCodes.BAD,
                    'Invalid meal plan format from GPT.'
                );
            }

            mealPlan.meals.forEach(meal => {
                if (!meal.mealType) {
                    meal.mealType = mealType;
                }
            });

            return sendResponse(
                res,
                responseStatusCodes.OK,
                'Meal plan generated successfully.',
                { clientId, goal, mealType, carbRange, calorieRange, mealPlan }
            );
        } catch (error) {
            console.error('Error generating meal plan:', error);
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'Failed to generate meal plan.'
            );
        }
    })
    ,
    // saveGPTMealPlan: asyncHandler(async (req, res) => {
    //     const { clientId, day, date, status, createdBy, mealPlan } = req.body;

    //     if (!clientId || !day || !date || !mealPlan) {
    //         return sendResponse(
    //             res,
    //             responseStatusCodes.BAD,
    //             'clientId, day, date, and mealPlan are required.'
    //         );
    //     }

    //     try {
    //         const mealReferences = [];

    //         for (const meal of mealPlan.meals) {
    //             const newMeal = new Meal({
    //                 mealName: meal.mealName,
    //                 mealType: meal.mealType,
    //                 totalCalories: meal.calories,
    //                 totalProtein: meal.protein,
    //                 totalFats: meal.fats,
    //                 totalCarbs: meal.carbs,
    //                 totalMeals: 1,
    //             });

    //             const savedMeal = await newMeal.save();

    //             const recipes = meal.recipes.map((recipe) => ({
    //                 recipeName: recipe.recipeName,
    //                 calories: meal.calories,
    //                 protein: meal.protein,
    //                 fats: meal.fats,
    //                 carbs: meal.carbs,
    //                 ingredients: recipe.ingredients.map(ingredient => ({
    //                     ingredientName: ingredient.ingredientName,
    //                     quantity: ingredient.quantity,
    //                 })),
    //                 steps: recipe.steps.map(step => ({
    //                     stepNumber: step.stepNumber,
    //                     instruction: step.instruction,
    //                 })),
    //                 mealId: savedMeal._id,
    //             }));

    //             await Recipe.insertMany(recipes);

    //             mealReferences.push({ mealId: savedMeal._id });
    //         }


    //         const clientMealPlan = new ClientMealPlan({
    //             clientId: new mongoose.Types.ObjectId(clientId),
    //             day,
    //             date: new Date(date),
    //             status: status || 'Assigned',
    //             meals: mealReferences,
    //             createdBy: new mongoose.Types.ObjectId(createdBy),
    //         });

    //         const savedMealPlan = await clientMealPlan.save();

    //         const admin = await AdminUser.findById(createdBy);
    //         if (!admin) {
    //             throw new Error('Admin not found');
    //         }

    //         const adminName = `${admin.firstName} ${admin.lastName}`;

    //         const notificationData = {
    //             title: 'Meal Plan Assigned',
    //             body: `A new meal plan has been assigned to you by ${adminName}.`,
    //             message: `You have received a new meal plan from ${adminName}. Check your meal plan section for details.`,
    //             clientId: clientId,
    //             adminId: admin._id,
    //         };

    //         await notificationService.createNotification(notificationData);
    //         const client = await Client.findById(clientId);
    //         if (client && client.fcmToken) {
    //             const pushNotificationData = {
    //                 title: 'Meal Plan Assigned',
    //                 body: `A new meal plan has been assigned to you by ${adminName}.`,
    //                 data: { mealPlanId: savedMealPlan._id.toString() },
    //                 fcmToken: client.fcmToken,
    //             };

    //             await systemNotificationServices.newNotification(
    //                 pushNotificationData.body,
    //                 pushNotificationData.title,
    //                 pushNotificationData.fcmToken,
    //                 pushNotificationData.data,
    //                 null
    //             );
    //         }

    //         return sendResponse(
    //             res,
    //             responseStatusCodes.OK,
    //             'Meal plan saved successfully.',
    //             { clientMealPlan: savedMealPlan }
    //         );
    //     } catch (error) {
    //         console.error('Error saving meal plan:', error);
    //         return sendResponse(
    //             res,
    //             responseStatusCodes.SERVER,
    //             'Failed to save meal plan.'
    //         );
    //     }
    // }),

    saveGPTMealPlan: asyncHandler(async (req, res) => {
        const { clientId, day, date, status, createdBy, mealPlan } = req.body;

        if (!clientId || !day || !date || !mealPlan) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'clientId, day, date, and mealPlan are required.'
            );
        }

        try {
            // Check if a meal plan already exists for the given clientId and date
            let existingMealPlan = await ClientMealPlan.findOne({ clientId, date: new Date(date) }).lean();

            // If a meal plan exists, update it, else proceed with creating a new one
            if (existingMealPlan) {
                // Update the existing meal plan with the new meal data
                existingMealPlan.status = status || 'Assigned';  // Update status if necessary
                existingMealPlan.day = day;

                // Remove existing meal references before saving the new ones
                existingMealPlan.meals = [];

                const mealReferences = [];

                // Iterate through the meals and save them
                for (const meal of mealPlan.meals) {
                    const newMeal = new Meal({
                        mealName: meal.mealName,
                        mealType: meal.mealType,
                        totalCalories: meal.calories,
                        totalProtein: meal.protein,
                        totalFats: meal.fats,
                        totalCarbs: meal.carbs,
                        totalMeals: 1,
                    });

                    const savedMeal = await newMeal.save();

                    const recipes = meal.recipes.map((recipe) => ({
                        recipeName: recipe.recipeName,
                        calories: meal.calories,
                        protein: meal.protein,
                        fats: meal.fats,
                        carbs: meal.carbs,
                        ingredients: recipe.ingredients.map(ingredient => ({
                            ingredientName: ingredient.ingredientName,
                            quantity: ingredient.quantity,
                        })),
                        steps: recipe.steps.map(step => ({
                            stepNumber: step.stepNumber,
                            instruction: step.instruction,
                        })),
                        mealId: savedMeal._id,
                    }));

                    await Recipe.insertMany(recipes);

                    mealReferences.push({ mealId: savedMeal._id });
                }

                // Update the meal references in the existing meal plan
                existingMealPlan.meals = mealReferences;

                // Save the updated meal plan
                await existingMealPlan.save();

                // Send response after update
                return sendResponse(
                    res,
                    responseStatusCodes.OK,
                    'Meal plan updated successfully.',
                    { clientMealPlan: existingMealPlan }
                );
            } else {
                // If no existing meal plan, create a new one as before
                const mealReferences = [];

                for (const meal of mealPlan.meals) {
                    const newMeal = new Meal({
                        mealName: meal.mealName,
                        mealType: meal.mealType,
                        totalCalories: meal.calories,
                        totalProtein: meal.protein,
                        totalFats: meal.fats,
                        totalCarbs: meal.carbs,
                        totalMeals: 1,
                    });

                    const savedMeal = await newMeal.save();

                    const recipes = meal.recipes.map((recipe) => ({
                        recipeName: recipe.recipeName,
                        calories: meal.calories,
                        protein: meal.protein,
                        fats: meal.fats,
                        carbs: meal.carbs,
                        ingredients: recipe.ingredients.map(ingredient => ({
                            ingredientName: ingredient.ingredientName,
                            quantity: ingredient.quantity,
                        })),
                        steps: recipe.steps.map(step => ({
                            stepNumber: step.stepNumber,
                            instruction: step.instruction,
                        })),
                        mealId: savedMeal._id,
                    }));

                    await Recipe.insertMany(recipes);

                    mealReferences.push({ mealId: savedMeal._id });
                }

                const clientMealPlan = new ClientMealPlan({
                    clientId: new mongoose.Types.ObjectId(clientId),
                    day,
                    date: new Date(date),
                    status: status || 'Assigned',
                    meals: mealReferences,
                    createdBy: new mongoose.Types.ObjectId(createdBy),
                });

                const savedMealPlan = await clientMealPlan.save();

                const admin = await AdminUser.findById(createdBy);
                if (!admin) {
                    throw new Error('Admin not found');
                }

                const adminName = `${admin.firstName} ${admin.lastName}`;

                const notificationData = {
                    title: 'Meal Plan Assigned',
                    body: `A new meal plan has been assigned to you by ${adminName}.`,
                    message: `You have received a new meal plan from ${adminName}. Check your meal plan section for details.`,
                    clientId: clientId,
                    adminId: admin._id,
                };

                await notificationService.createNotification(notificationData);

                const client = await Client.findById(clientId);
                if (client && client.fcmToken) {
                    const pushNotificationData = {
                        title: 'Meal Plan Assigned',
                        body: `A new meal plan has been assigned to you by ${adminName}.`,
                        data: { mealPlanId: savedMealPlan._id.toString() },
                        fcmToken: client.fcmToken,
                    };

                    await systemNotificationServices.newNotification(
                        pushNotificationData.body,
                        pushNotificationData.title,
                        pushNotificationData.fcmToken,
                        pushNotificationData.data,
                        null
                    );
                }

                return sendResponse(
                    res,
                    responseStatusCodes.OK,
                    'Meal plan saved successfully.',
                    { clientMealPlan: savedMealPlan }
                );
            }
        } catch (error) {
            console.error('Error saving meal plan:', error);
            return sendResponse(
                res,
                responseStatusCodes.SERVER,
                'Failed to save meal plan.'
            );
        }
    }),
    createMealPlan: asyncHandler(async (req, res) => {

        const { error } = validateClientMealPlan(req.body);
        if (error) {
            return sendResponse(res, responseStatusCodes.BAD, error.details[0].message);
        }



        try {

            //await clientMealPlanService.checkMealPlanOverlap(clientId, new Date(startDate), new Date(endDate));

            const mealPlan = await clientMealPlanService.createMealPlan(req.body);

            return sendResponse(res, responseStatusCodes.CREATED, 'Meal plan created and assigned successfully', mealPlan);
        } catch (err) {
            return sendResponse(res, responseStatusCodes.BAD, err.message);
        }
    }),

    getMealPlans: asyncHandler(async (req, res) => {
        const mealPlans = await clientMealPlanService.getMealPlans(req.query.clientId);
        return sendResponse(res, responseStatusCodes.OK, 'Meal plans retrieved successfully', mealPlans);
    }),

    getMealPlanById: asyncHandler(async (req, res) => {
        const mealPlan = await clientMealPlanService.getMealPlanById(req.params.id);
        if (!mealPlan) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal plan not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Meal plan retrieved successfully', mealPlan);
    }),

    getMealPlanByClientId: asyncHandler(async (req, res) => {
        const { clientId, date } = req.body;
        const mealPlan = await clientMealPlanService.getClientMealPlanWithMealsAndRecipes(clientId, date);
        if (!mealPlan) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal plan not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Meal plan retrieved successfully', mealPlan);
    }),

    updateMealPlan: asyncHandler(async (req, res) => {
        const { error } = validateClientMealPlan(req.body);
        if (error) {
            return sendResponse(res, responseStatusCodes.BAD, error.details[0].message);
        }

        const updatedMealPlan = await clientMealPlanService.updateMealPlan(req.params.id, req.body);
        if (!updatedMealPlan) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal plan not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Meal plan updated successfully', updatedMealPlan);
    }),

    deleteMealPlan: asyncHandler(async (req, res) => {
        const result = await clientMealPlanService.deleteMealPlan(req.params.id);
        if (!result) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal plan not found');
        }
        return sendResponse(res, responseStatusCodes.OK, 'Meal plan deleted successfully');
    }),
    updateMealPlanStatus: asyncHandler(async (req, res) => {
        const { clientId, date, status } = req.body;

        if (!clientId || !date || !status) {
            return sendResponse(res, responseStatusCodes.BAD, 'clientId, date, and status are required.');
        }

        try {

            const mealPlan = await ClientMealPlan.findOne({
                clientId,
                date: new Date(date),
            });

            if (!mealPlan) {
                return sendResponse(res, responseStatusCodes.NOTFOUND, 'Meal plan not found for the given date and clientId.');
            }

            mealPlan.status = status;
            await mealPlan.save();

            const client = await Client.findById(clientId);
            if (client) {
                const { mealPlanStatusStartDate, mealPlanStatusEndDate } = client;

                if (mealPlanStatusStartDate && mealPlanStatusEndDate) {
                    const mealPlansInRange = await ClientMealPlan.find({
                        clientId,
                        date: { $gte: mealPlanStatusStartDate, $lte: mealPlanStatusEndDate },
                    });

                    const allCompleted = mealPlansInRange.every(plan => plan.status === 'Completed');

                    if (allCompleted) {
                        client.mealPlanStatus = 'Not Requested';
                        client.mealPlanStatusStartDate = null;
                        client.mealPlanStatusEndDate = null;
                    } else {
                        client.mealPlanStatus = 'Assigned';
                    }

                    await client.save();
                }
            }

            return sendResponse(res, responseStatusCodes.OK, 'Meal plan status updated successfully.', mealPlan);
        } catch (error) {
            console.error('Error updating meal plan status:', error);
            return sendResponse(res, responseStatusCodes.ERROR, 'Internal server error.');
        }
    })
    ,

};

module.exports = clientMealPlanController;
