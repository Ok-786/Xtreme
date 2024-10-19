const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fitnessQuestionsSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client', // Assuming you have a 'Client' model
        required: true,
    },
    currentPhysicalActivityLevel: {
        type: String,
        required: true,
    },
    howOftenEngageInPhysicalActivity: {
        type: String,
        required: true,
    },
    preferredTypeOfPhysicalActivity: {
        type: String,
        required: true,
    },
    daysPerWeekExercise: {
        type: Number,
        required: true,
    },
    currentDiet: {
        type: String,
        required: true,
    },
    howOftenEatUnhealthyFood: {
        type: String,
        required: true,
    },
    waterIntakePerDay: {
        type: String,
        required: true,
    },
    vitaminsOrSupplements: {
        type: String,
        required: true,
    },
    adequateSleepPerNight: {
        type: String,
        required: true,
    },
    medicalOrHealthConditions: {
        type: String,
        required: true,
    },
    injuriesOrPhysicalLimitations: {
        type: String,
        required: true,
    },
    goals: {
        weightLoss: { type: Boolean, default: false },
        muscleGain: { type: Boolean, default: false },
        overallHealthImprovement: { type: Boolean, default: false },
    },
    idealBodyWeight: {
        type: Number,
        required: true,
    },
    healthAndFitnessGoals: {
        type: String,
        required: true,
    },
    commitmentLevelToGoals: {
        type: String,
        required: true,
    },
    currentStressLevel: {
        type: String,
        required: true,
    },
    stressManagement: {
        type: String,
        required: true,
    },
    activitiesEnjoyed: {
        type: String,
        required: true,
    },
    motivationToStayHealthy: {
        type: String,
        required: true,
    },
    gymAccess: {
        type: String,
        required: true, // Can be 'Yes' or 'No' or any string-based answer
    },
}, { timestamps: true });

const FitnessQuestions = mongoose.model('FitnessQuestions', fitnessQuestionsSchema);

module.exports = FitnessQuestions;
