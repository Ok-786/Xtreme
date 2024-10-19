const express = require('express');
const messageController = require('./messageController');
const messageRouter = express.Router();

messageRouter.post('/', messageController.sendMessage);
messageRouter.post('/reply/:messageId', messageController.replyToMessage);
messageRouter.get('/:clientId', messageController.getMessagesForClient);

module.exports = messageRouter;
