
const Message = require('./messageModel');

const messageService = {
    sendMessage: async (clientId, content) => {
        const message = new Message({ clientId, content });
        // console.log('Message saved successfully:', message);
        return await message.save();
    },
    replyToMessage: async (messageId, adminId, content) => {
        const message = await Message.findById(messageId);
        if (!message) throw new Error('Message not found');
        message.adminId = adminId;
        message.content = content;
        message.isAdminReply = true;
        return await message.save();
    },
    getMessagesForClient: async (clientId) => {
        return await Message.find({ clientId }).populate('adminId');
    },
};

module.exports = messageService;
