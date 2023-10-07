// server.js
const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const dotenv = require('dotenv');
const { log, logLevels } = require('./src/utils/logger');
const socketConnection = require('./socket');
dotenv.config();

const PORT = process.env.PORT || 3030;
socketConnection(server);
server.listen(PORT, () => {
  log(logLevels.INFO, `Server is running on port ${PORT}`);
});

module.exports = server;
