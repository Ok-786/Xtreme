const { log, logLevels } = require('../utils/logger');
const mongoose = require('mongoose');

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    log(logLevels.INFO, 'Database connected.');
  })
  .catch((err) => {
    log(logLevels.ERROR, err.message);
  });
