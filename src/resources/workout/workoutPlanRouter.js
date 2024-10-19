const express = require('express');
const workoutPlanController = require('./workoutPlanController');
const workoutPlanRouter = express.Router();

workoutPlanRouter
    .route('/')
    .post(workoutPlanController.createWorkoutPlan);

workoutPlanRouter
    .route('/:id')
    .get(workoutPlanController.getWorkoutPlanById)
    .put(workoutPlanController.updateWorkoutPlan)
    .delete(workoutPlanController.deleteWorkoutPlan);

workoutPlanRouter
    .route('/client/:clientId')
    .get(workoutPlanController.getAllWorkoutPlansByClient);

module.exports = workoutPlanRouter;
