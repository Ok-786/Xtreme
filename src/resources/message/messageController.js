// src/resources/messages/messageController.js
const asyncHandler = require('express-async-handler');
const messageService = require('./messageService');
const sendResponse = require('../../utils/sendResponse');
const responseStatusCodes = require('../../constants/responseStatusCodes');

const messageController = {
    sendMessage: asyncHandler(async (req, res) => {
        const { clientId, content } = req.body;
        const message = await messageService.sendMessage(clientId, content);

        return sendResponse(res, responseStatusCodes.CREATED, 'Message sent successfully', message);
    }),

    replyToMessage: asyncHandler(async (req, res) => {
        const { messageId } = req.params;
        const { adminId, content } = req.body;
        const updatedMessage = await messageService.replyToMessage(messageId, adminId, content);

        return sendResponse(res, responseStatusCodes.OK, 'Reply sent successfully', updatedMessage);
    }),

    getMessagesForClient: asyncHandler(async (req, res) => {
        const { clientId } = req.params;
        const messages = await messageService.getMessagesForClient(clientId);

        return sendResponse(res, responseStatusCodes.OK, 'Messages retrieved successfully', messages);
    }),
};

module.exports = messageController;
