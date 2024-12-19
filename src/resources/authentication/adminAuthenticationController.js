const asyncHandler = require('express-async-handler');
const adminAuthenticationValidator = require('./adminAuthenticationValidator');
const { BAD, SUCCESS, UNAUTHORIZED, OK } = require('../../constants/responseStatusCodes');
const passwordServices = require('../../utils/passwordServices');
const jwtServices = require('../../utils/jwtServices');
const sendResponse = require('../../utils/sendResponse');
const AdminUser = require('../adminUser/adminUserModel');
const Client = require('../clients/clientModel');

const adminAuthenticationController = {
    adminLogin: asyncHandler(async (req, res) => {
        // Validate the login request
        const validationResult = adminAuthenticationValidator.adminLogin.validate(req.body);
        if (validationResult.error) {
            return await sendResponse(
                res,
                BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
            return;
        }

        const { email, password, fcmToken } = req.body;

        const adminUser = await AdminUser.findOne({ email });
        const clientUser = await Client.findOne({ email });

        if (adminUser) {
            const validatePassword = await passwordServices.authenticate(password, adminUser.password);
            if (validatePassword) {
                if (fcmToken) {
                    adminUser.fcmToken = fcmToken;
                    await adminUser.save();
                }
                delete adminUser.password;
                const accessToken = jwtServices.create({ adminId: adminUser._id });
                const data = { adminUser, accessToken };
                return await sendResponse(res, OK, 'Admin Logged In', data, req.logId);
            } else {
                return await sendResponse(
                    res,
                    UNAUTHORIZED,
                    'Authentication failed',
                    null,
                    req.logId
                );
            }
        }

        else if (clientUser) {
            const validatePassword = await passwordServices.authenticate(password, clientUser.password);
            if (validatePassword) {
                if (fcmToken) {
                    clientUser.fcmToken = fcmToken;
                    clientUser.lastLogin = Date.now();
                    await clientUser.save();
                }
                delete clientUser.password;
                const accessToken = jwtServices.create({ clientId: clientUser._id });
                const data = { clientUser, accessToken };
                return await sendResponse(res, OK, 'Client Logged In', data, req.logId);
            } else {
                return await sendResponse(
                    res,
                    UNAUTHORIZED,
                    'Authentication failed',
                    null,
                    req.logId
                );
            }
        }
        else {
            return await sendResponse(
                res,
                UNAUTHORIZED,
                'Authentication failed',
                null,
                req.logId
            );
        }
    }),

    logout: asyncHandler(async (req, res) => {
        const { email } = req.body;

        const adminUser = await AdminUser.findOne({ email });
        const clientUser = await Client.findOne({ email });

        if (adminUser) {
            adminUser.fcmToken = null;
            await adminUser.save();

            return await sendResponse(res, OK, 'Logged out ', null, req.logId);
        }

        else if (clientUser) {
            clientUser.fcmToken = null;
            await clientUser.save();

            return await sendResponse(res, OK, 'Logged out ', null, req.logId);
        }

        else {
            return await sendResponse(
                res,
                UNAUTHORIZED,
                'User not found or already logged out',
                null,
                req.logId
            );
        }
    })
};

module.exports = adminAuthenticationController;
