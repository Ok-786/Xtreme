const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nutritionAndExerciseHabitsSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client', // Assuming you have a 'Client' model
        required: true,
    },
    currentPhysicalActivityLevel: {
        type: String,
        required: true,
    },
    timesEatPerDay: {
        type: Number,
        required: true,
    },
    currentDietType: {
        type: String,
        required: true,
    },
    daysPerWeekForFitness: {
        type: Number,
        required: true,
    },
    involvedInAerobicExercise: {
        type: Boolean,
        required: true,
    },
    liftingWeights: {
        type: Boolean,
        required: true,
    },
    exerciseTimeCommitment: {
        type: String,
        required: true, // Example: "1 hour per day"
    },
    motivationToGetInShape: {
        type: String,
        required: true,
    },
    foodsToAvoid: {
        type: String,
        required: false, // Optional field
    },
    foodAllergies: {
        type: String,
        required: false, // Optional field
    },
    dietaryRestrictions: {
        type: String,
        required: false, // Optional field
    },
    injuriesThatCanBeWorsenedByExercise: {
        type: String,
        required: false, // Optional field
    },
    needMedicalClearance: {
        type: Boolean,
        required: true,
    },
    healthConditionsPreventingExercise: {
        type: String,
        required: false, // Optional field
    },
    prescribedMedicationsOrSupplements: {
        type: String,
        required: false, // Optional field
    },
    wouldLikeToExercise: {
        type: Boolean,
        required: true,
    },
    equipmentForExercising: {
        type: String,
        required: false, // Optional field
    },
}, { timestamps: true });

const NutritionAndExerciseHabits = mongoose.model('NutritionAndExerciseHabits', nutritionAndExerciseHabitsSchema);

module.exports = NutritionAndExerciseHabits;
