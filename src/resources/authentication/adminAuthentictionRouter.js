const express = require('express');
const { adminLogin } = require('./adminAuthenticationController');
const adminAuthenticationRouter = express.Router();

adminAuthenticationRouter.route('/login').post(adminLogin);

module.exports = adminAuthenticationRouter;
