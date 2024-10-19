const asyncHandler = require('express-async-handler');
const workoutPlanServices = require('./workoutPlanServices');
const sendResponse = require('../../utils/sendResponse');
const workoutPlanValidator = require('./workoutPlanValidator');
const responseStatusCodes = require('../../constants/responseStatusCodes');

const workoutPlanController = {
    createWorkoutPlan: asyncHandler(async (req, res) => {
        const validationResult = workoutPlanValidator.create.validate(req.body);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        const workoutPlan = await workoutPlanServices.create(req.body);
        return await sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Workout Plan created successfully',
            workoutPlan,
            req.logId
        );
    }),

    getAllWorkoutPlansByClient: asyncHandler(async (req, res) => {
        const { clientId } = req.params;
        const workoutPlans = await workoutPlanServices.getAllByClient(clientId);
        return await sendResponse(
            res,
            responseStatusCodes.OK,
            'Workout Plans retrieved successfully',
            workoutPlans,
            req.logId
        );
    }),

    updateWorkoutPlan: asyncHandler(async (req, res) => {
        const validationResult = workoutPlanValidator.update.validate(req.body);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }
        const updatedWorkoutPlan = await workoutPlanServices.update(req.params.id, req.body);
        if (updatedWorkoutPlan) {
            return await sendResponse(
                res,
                responseStatusCodes.OK,
                'Workout Plan updated successfully',
                updatedWorkoutPlan,
                req.logId
            );
        } else {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Workout Plan not found',
                null,
                req.logId
            );
        }
    }),

    deleteWorkoutPlan: asyncHandler(async (req, res) => {
        const deleted = await workoutPlanServices.delete(req.params.id);
        if (!deleted) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Workout Plan not found',
                null,
                req.logId
            );
        }
        return await sendResponse(
            res,
            responseStatusCodes.OK,
            'Workout Plan deleted successfully.',
            null,
            req.logId
        );
    }),

    getWorkoutPlanById: asyncHandler(async (req, res) => {
        const workoutPlan = await workoutPlanServices.getById(req.params.id);
        if (!workoutPlan) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Workout Plan not found',
                null,
                req.logId
            );
        }
        return await sendResponse(
            res,
            responseStatusCodes.OK,
            'Workout Plan retrieved successfully',
            workoutPlan,
            req.logId
        );
    }),
};

module.exports = workoutPlanController;
