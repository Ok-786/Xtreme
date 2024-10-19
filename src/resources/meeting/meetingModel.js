const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for meetings
const meetingSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client', // Assuming you have a Client model
        required: true,
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'AdminUser', // Assuming you have an AdminUser model
        required: true,
    },
    meetingDate: {
        type: Date,
        required: true,
    },
    meetingTime: {
        type: String, // You can use a string for time or change to Date if preferred
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'], // Status options for the meeting
        default: 'Pending',
    },
    notes: {
        type: String, // Optional notes regarding the meeting request
    },
}, { timestamps: true }); // This will add createdAt and updatedAt fields

const MeetingModel = mongoose.model('Meeting', meetingSchema);

module.exports = MeetingModel;
