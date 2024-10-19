const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workoutPlanSchema = new Schema(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        day: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        period: {
            type: String,
            enum: ['Weekly', 'Monthly', 'Daily'],

        },

        exercises: [{
            exerciseId: {
                type: Schema.Types.ObjectId,
                ref: 'Exercise',
                required: true, // Always required for workout plans
            },
        }],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'AdminUser',
            required: true,
        },
    },
    { timestamps: true }
);

const workoutPlanModel = mongoose.model('WorkoutPlan', workoutPlanSchema);
module.exports = workoutPlanModel;
