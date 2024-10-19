const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
        },
        status: {
            type: Boolean,
            default: true, // Active by default
        },
        address: {
            type: String,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        profilePicture: {
            type: String, // URL or file path for the profile picture
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'AdminUser',
        },
    },
    { timestamps: true }
);

clientSchema.pre('save', async function (next) {
    // You can add any pre-save validation or logic here if needed

    next();
});

const clientModel = mongoose.model('Client', clientSchema);

module.exports = clientModel;
