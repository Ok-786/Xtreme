// socket.js
const socket = require('socket.io');
const app = require('./app');
const { log, logLevels } = require('./src/utils/logger');
const messageService = require('./src/resources/message/messageService');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types; // Import ObjectId

const socketConnection = (server) => {
    console.log('Entering socketConnection function');
    const io = socket(server, {
        cors: { origin: '*' },
        maxHttpBufferSize: 100 * 1024 * 1024, // 100MB in bytes
    });

    app.set('io', io);
    console.log('Socket.io is initialized and waiting for connections...');

    io.on('connection', async (socket) => {
        log(logLevels.INFO, 'Socket Connected');
        console.log('A client connected:', socket.id);
        socket.on('sendMessage', async ({ clientId, content }) => {
            try {
                const message = await messageService.sendMessage(new ObjectId(clientId), content);
                socket.broadcast.emit('receiveMessage', message);
                console.log('Message sent:', message);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('replyToMessage', async ({ messageId, adminId, content }) => {
            try {
                const updatedMessage = await messageService.replyToMessage(new ObjectId(messageId), new ObjectId(adminId), content);
                socket.broadcast.emit('receiveReply', updatedMessage);
                console.log('Reply sent:', updatedMessage);
            } catch (error) {
                console.error('Error replying to message:', error);
            }
        });

        socket.on('disconnect', () => {
            log(logLevels.INFO, 'Socket disconnected');
            console.log('A client disconnected:', socket.id); // Log for client disconnection
        });
    });
};

module.exports = socketConnection;
