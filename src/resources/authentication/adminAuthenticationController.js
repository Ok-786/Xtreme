const asyncHandler = require('express-async-handler');
const adminAuthenticationValidator = require('./adminAuthenticationValidator');
const adminUserServices = require('../adminUser/adminUserServices');
const {
  BAD,
  SUCCESS,
  UNAUTHORIZED,
  OK,
} = require('../../constants/responseStatusCodes');
const passwordServices = require('../../utils/passwordServices');
const jwtServices = require('../../utils/jwtServices');
const sendResponse = require('../../utils/sendResponse');

const adminAuthenticationController = {
  adminLogin: asyncHandler(async (req, res) => {
    const validationResult = adminAuthenticationValidator.adminLogin.validate(
      req.body
    );
    if (validationResult.error) {
      await sendResponse(
        res,
        BAD,
        validationResult.error.details[0].message,
        null,
        req.logId
      );
      return;
    }
    const { email, password } = req.body;
    const adminUser = await adminUserServices.getByEmail(email);
    console.log(adminUser);
    if (!adminUser) {
      await sendResponse(
        res,
        UNAUTHORIZED,
        'Authentication failed',
        null,
        req.logId
      );
      return;
    }
    const validatePassword = await passwordServices.authenticate(
      password,
      adminUser.password
    );
    if (validatePassword) {
      delete adminUser.password;
      const accessToken = jwtServices.create({ adminId: adminUser._id });
      data = { adminUser, accessToken };
      await sendResponse(res, OK, 'User LoggedIn', data, req.logId);
    } else {
      await sendResponse(
        res,
        UNAUTHORIZED,
        'Authentication failed',
        null,
        req.logId
      );
    }
  }),
};
module.exports = adminAuthenticationController;
