const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const demographicsSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],

    },
    age: {
        type: Number,

    },
    height: {
        type: Number,

    },
    weight: {
        type: Number,

    },
}, { timestamps: true });

const Demographics = mongoose.model('Demographics', demographicsSchema);

module.exports = Demographics;
