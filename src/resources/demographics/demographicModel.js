const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const demographicsSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client', required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    weight: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

const Demographics = mongoose.model('Demographics', demographicsSchema);

module.exports = Demographics;
