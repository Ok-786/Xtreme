// src/resources/messages/messageModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        adminId: {
            type: Schema.Types.ObjectId,
            ref: 'AdminUser',
        },
        content: {
            type: String,
            required: true,
        },
        isAdminReply: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
