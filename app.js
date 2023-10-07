// app.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
require('dotenv').config();
const app = express();
const version = process.env.VERSION;
const sendResponse = require('./src/utils/sendResponse');
const encryptionMiddleware = require('./src/middleware/encryptionMiddleware');
const apiLogMiddleware = require('./src/middleware/apiLogMiddleWare');
//Routes Imports
const encryptionHelperRouter = require('./src/resources/encryptionHelper/router');
const responseStatusCodes = require('./src/constants/responseStatusCodes');
const adminUserRouter = require('./src/resources/adminUser/adminUserRouter');
const adminAuthenticationRouter = require('./src/resources/authentication/adminAuthentictionRouter');
//requiring db connection
require('./src/config/db');

// Use CORS middleware
app.use(cors());

//Morgan request logger
app.use(logger('dev'));

//use JSON parser
app.use(express.json({ limit: '16mb' }));

//static path
app.use(express.static(path.join(__dirname, 'public')));

// use Encryption middleware
if (process.env.ENV !== 'dev') {
  app.use(encryptionMiddleware);
  app.use(apiLogMiddleware);
}

// Define routes
app.get('/', (req, res) => {
  res.send({ message: 'POS-api Server...' });
});

app.use(`/api/${version}/encryption`, encryptionHelperRouter);
app.use(`/api/${version}/adminAuthentication`, adminAuthenticationRouter);
app.use(`/api/${version}/adminUser`, adminUserRouter);

app.use(async (req, res, next) => {
  await sendResponse(
    res,
    responseStatusCodes.NOTFOUND,
    'Not Found',
    null,
    req.logId
  );

  return;
});

//error handler
app.use(async (err, req, res, next) => {
  console.log(err);
  await sendResponse(
    res,
    responseStatusCodes.SERVER,
    err.message,
    null,
    req.logId
  );
});
// Export the app
module.exports = app;
