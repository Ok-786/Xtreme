const socket = require('socket.io');
const app = require('./app');
const { log, logLevels } = require('./src/utils/logger');
const socketConnection = (server) => {
  const io = socket(server, {
    cors: { origin: '*' },
    maxHttpBufferSize: 100 * 1024 * 1024, // 100MB in bytes
  });
  app.set('io', io);
  io.on('connection', async (socket) => {
    log(logLevels.INFO, 'Socket Connected');
    socket.on('disconnect', () => {
      log(logLevels.INFO, 'Socket disconnected');
    });
  });
};

module.exports = socketConnection;
