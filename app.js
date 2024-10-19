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
const { setupSwagger } = require('./swagger');
const adminRoleRouter = require('./src/resources/role/roleRouter');
const clientRouter = require('./src/resources/clients/clientRouter');
const errorHandler = require('./src/middleware/errorHandler');
const exerciseRouter = require('./src/resources/exercise/exerciseRouter');
const mealRouter = require('./src/resources/meals/mealRouter');
const workoutPlanRouter = require('./src/resources/workout/workoutPlanRouter');
const recipeRouter = require('./src/resources/recipe/recipeRouter');
const messageRouter = require('./src/resources/message/messageRouter');
const FitnessRouter = require('./src/resources/fitnessQuestionares/fitnessQuestionaresRouter');
//requiring db connection
require('./src/config/db');

// Use CORS middleware
app.use(cors());

//Morgan request logger
app.use(logger('dev'));

//use JSON parser
app.use(express.json({ limit: '16mb' }));
// Set up Swagger
setupSwagger(app);
//static path
app.use(express.static(path.join(__dirname, 'public')));

// use Encryption middleware
if (process.env.NODE_ENV !== 'dev') {
    app.use(encryptionMiddleware);
    app.use(apiLogMiddleware);
}

// Define routes
app.get('/', (req, res) => {
    res.send({ message: 'Xtreme-api Server...' });
});

app.use(`/api/${version}/encryption`, encryptionHelperRouter);
app.use(`/api/${version}/adminAuthentication`, adminAuthenticationRouter);
app.use(`/api/${version}/adminUser`, adminUserRouter);
app.use(`/api/${version}/role`, adminRoleRouter);
app.use(`/api/${version}/client`, clientRouter);
app.use(`/api/${version}/exercise`, exerciseRouter);
app.use(`/api/${version}/auth`, adminAuthenticationRouter);
app.use(`/api/${version}/meal`, mealRouter);
app.use(`/api/${version}/workout`, workoutPlanRouter);
app.use(`/api/${version}/recipe`, recipeRouter);
app.use(`/api/${version}/messages`, messageRouter);
app.use(`/api/${version}/fitness`, FitnessRouter);

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
app.use(errorHandler)
// Export the app
module.exports = app;
