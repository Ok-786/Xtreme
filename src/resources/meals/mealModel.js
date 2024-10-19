const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mealSchema = new Schema({
    mealName: {
        type: String,
        required: true,
    },
    mealType: {
        type: String,
        enum: ['Macro-Based', 'Calorie-Based', 'Custom'],
        required: true,
    },
    totalCalories: {
        type: Number,
        default: 0, // Default value
    },
    totalProtein: {
        type: Number,
        default: 0, // Default value
    },
    totalFats: {
        type: Number,
        default: 0, // Default value
    },
    totalCarbs: {
        type: Number,
        default: 0, // Default value
    },
    totalMeals: {
        type: Number,
        default: 0, // Default value
    },
}, { timestamps: true });



const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
