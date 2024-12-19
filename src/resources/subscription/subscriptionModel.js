const mongoose = require('mongoose');
const Client = require('../clients/clientModel.js')
const subscriptionSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    planType: {
        type: String,
        enum: ['Silver', 'Gold', 'Platinum'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    durationMonths: {
        type: Number,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    payment: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Expired', 'OnGoing'],
    }
});



const Subscription = mongoose.model('Subscription', subscriptionSchema);

const updateSubscriptionStatuses = async () => {
    const currentDate = new Date();

    await Subscription.updateMany(
        { expirationDate: { $lte: currentDate } },
        { status: 'Expired' }
    );

    // await Subscription.updateMany(
    //     { expirationDate: { $gte: currentDate } },
    //     { status: 'OnGoing' }
    // );

    await Client.updateMany(
        {
            workoutPlanStatusEndDate: { $lte: currentDate },
        },
        {
            workoutPlanStatus: 'Not Requested',
            workoutPlanStatusStartDate: null,
            workoutPlanStatusEndDate: null,
        }
    );
    await Client.updateMany(
        {
            mealPlanStatusEndDate: { $lt: currentDate },
        },
        {
            mealPlanStatus: 'Not Requested',
            mealPlanStatusStartDate: null,
            mealPlanStatusEndDate: null,
        }
    );

    console.log('Subscription and client statuses updated where necessary.');
};
;
module.exports = { Subscription, updateSubscriptionStatuses };
