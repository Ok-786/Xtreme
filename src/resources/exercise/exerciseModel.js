const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        primaryFocus: {
            type: String,
            enum: ['Upper Body', 'Lower Body', 'Core', 'Full Body', 'Cardio'],
            required: true,
        },
        movementPattern: {
            type: String,
            required: true,
        },
        equipment: {
            type: String,
            required: false,
        },
        intensity: {
            type: String, // e.g., "Low", "Medium", "High"
            required: true,
        },
        duration: {
            type: Number, // Duration in minutes or seconds
            required: true,
        },
        sets: {
            type: Number, // Number of sets
            required: true,
        },
        reps: {
            type: Number, // Number of repetitions
            required: true,
        },
        videoLink: {
            type: String,
            required: false,
        },
        steps: [
            {
                stepNumber: { type: Number, required: true }, // Step number (1, 2, 3, ...)
                instruction: { type: String, required: true }, // Step instruction
            },
        ],
        picture: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

const exerciseModel = mongoose.model('Exercise', exerciseSchema);
module.exports = exerciseModel;
