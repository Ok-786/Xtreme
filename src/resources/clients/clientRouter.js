const express = require('express');
const {
    createClient,
    updateClient,
    getAllClients,
    getClientById,
    deleteClient,
    requestPlan,
    dashboard,
    clientInsightsController,
    changePassword,
    sendOTP,
    validateOTP,
    changePasswordByEmail
} = require('./clientController');

const clientRouter = express.Router();


clientRouter.post('/request-plan', requestPlan);
clientRouter.put('/changePassword', changePassword);
clientRouter.get('/dashboard/:id', dashboard);
clientRouter.get('/getInsights', clientInsightsController);
clientRouter.post('/validateOTP', validateOTP);
clientRouter.post('/forgotPassword', sendOTP);
clientRouter.post('/resetPassword', changePasswordByEmail)

clientRouter.route('/')
    .post(createClient)
    .get(getAllClients)
    .put(updateClient);

clientRouter.route('/:id')
    .get(getClientById)
    .delete(deleteClient);


module.exports = clientRouter;
