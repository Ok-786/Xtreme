const Joi = require('joi');

const createFitnessQuestionsValidator = (req, res, next) => {
    const schema = Joi.object({
        clientId: Joi.string().length(24).required(),
        currentPhysicalActivityLevel: Joi.string().required(),
        howOftenEngageInPhysicalActivity: Joi.string().required(),
        preferredTypeOfPhysicalActivity: Joi.string().required(),
        daysPerWeekExercise: Joi.number().required(),
        currentDiet: Joi.string().required(),
        howOftenEatUnhealthyFood: Joi.string().required(),
        waterIntakePerDay: Joi.string().required(),
        vitaminsOrSupplements: Joi.string().required(),
        adequateSleepPerNight: Joi.string().required(),
        medicalOrHealthConditions: Joi.string().required(),
        injuriesOrPhysicalLimitations: Joi.string().required(),
        goals: Joi.object({
            weightLoss: Joi.boolean(),
            muscleGain: Joi.boolean(),
            overallHealthImprovement: Joi.boolean(),
        }).required(),
        idealBodyWeight: Joi.number().required(),
        healthAndFitnessGoals: Joi.string().required(),
        commitmentLevelToGoals: Joi.string().required(),
        currentStressLevel: Joi.string().required(),
        stressManagement: Joi.string().required(),
        activitiesEnjoyed: Joi.string().required(),
        motivationToStayHealthy: Joi.string().required(),
        gymAccess: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};

const combinedSchema = Joi.object({
    // Demographics validation
    clientId: Joi.string().length(24).required(),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    age: Joi.number().required(),
    height: Joi.number().required(),
    weight: Joi.number().required(),

    // Fitness question validation
    currentPhysicalActivityLevel: Joi.string().required(),
    howOftenEngageInPhysicalActivity: Joi.string().required(),
    preferredTypeOfPhysicalActivity: Joi.string().required(),
    daysPerWeekExercise: Joi.number().required(),
    currentDiet: Joi.string().required(),
    howOftenEatUnhealthyFood: Joi.string().required(),
    waterIntakePerDay: Joi.string().required(),
    vitaminsOrSupplements: Joi.string().required(),
    adequateSleepPerNight: Joi.string().required(),
    medicalOrHealthConditions: Joi.string().required(),
    injuriesOrPhysicalLimitations: Joi.string().required(),
    goals: Joi.object({
        weightLoss: Joi.boolean(),
        muscleGain: Joi.boolean(),
        overallHealthImprovement: Joi.boolean(),
    }).required(),
    idealBodyWeight: Joi.number().required(),
    healthAndFitnessGoals: Joi.string().required(),
    commitmentLevelToGoals: Joi.string().required(),
    currentStressLevel: Joi.string().required(),
    stressManagement: Joi.string().required(),
    activitiesEnjoyed: Joi.string().required(),
    motivationToStayHealthy: Joi.string().required(),
    gymAccess: Joi.string().required(),

    // Nutrition and exercise habits validation
    timesEatPerDay: Joi.number().required(),
    currentDietType: Joi.string().required(),
    daysPerWeekForFitness: Joi.number().required(),
    involvedInAerobicExercise: Joi.boolean().required(),
    liftingWeights: Joi.boolean().required(),
    exerciseTimeCommitment: Joi.string().required(),
    motivationToGetInShape: Joi.string().required(),
    foodsToAvoid: Joi.string().optional(),
    foodAllergies: Joi.string().optional(),
    dietaryRestrictions: Joi.string().optional(),
    injuriesThatCanBeWorsenedByExercise: Joi.string().optional(),
    needMedicalClearance: Joi.boolean().required(),
    healthConditionsPreventingExercise: Joi.string().optional(),
    prescribedMedicationsOrSupplements: Joi.string().optional(),
    wouldLikeToExercise: Joi.boolean().required(),
    equipmentForExercising: Joi.string().optional(),
});
module.exports = {
    createFitnessQuestionsValidator,
    combinedSchema
};
