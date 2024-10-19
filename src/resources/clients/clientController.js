const asyncHandler = require('express-async-handler');
const clientServices = require('./clientService');
const sendResponse = require('../../utils/sendResponse');
const clientValidator = require('./clientValidator');
const clientModel = require('./clientModel')
const responseStatusCodes = require('../../constants/responseStatusCodes');
const passwordServices = require('../../utils/passwordServices');
const clientController = {
    createClient: asyncHandler(async (req, res) => {
        // Validate the request body
        const validationResult = clientValidator.create.validate(req.body);
        if (validationResult.error) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                `Validation error on field '${validationResult.error.details[0].path[0]}': ${validationResult.error.details[0].message}`,
                null,
                req.logId
            );
        }

        // Check for duplicate email
        console.log("email", req.body.email);
        const dup = await clientModel.findOne({ email: req.body.email });
        console.log("dup", dup)
        if (dup) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                `Email already exists: ${req.body.email}`,
                null,
                req.logId
            );
        }

        // Hash the password
        req.body.password = await passwordServices.hash(req.body.password, 12);

        // Create the new client
        const newClient = await clientServices.create(req.body);

        return sendResponse(
            res,
            responseStatusCodes.CREATED,
            'Client created successfully',
            newClient,
            req.logId
        );
    })
    ,

    updateClient: asyncHandler(async (req, res) => {
        console.log("Request Body:", req.body); // Log the request body

        const validationResult = clientValidator.update.validate(req.body);
        if (validationResult.error) {
            console.log("Validation Error:", validationResult.error.details[0].message); // Log validation error
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        console.log("Attempting to update client with ID:", req.body.clientId);
        const updatedClient = await clientServices.update(req.body.clientId, req.body);
        if (!updatedClient) {
            console.log("Client not found for ID:", req.body.clientId); // Log if client not found
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Client not found',
                null,
                req.logId
            );
        }

        console.log("Client updated successfully:", updatedClient); // Log the updated client
        await sendResponse(
            res,
            responseStatusCodes.OK,
            'Client updated successfully',
            updatedClient,
            req.logId
        );
    })
    ,

    getAllClients: asyncHandler(async (req, res) => {
        const clients = await clientServices.getAll();
        await sendResponse(
            res,
            responseStatusCodes.OK,
            'Clients retrieved successfully',
            clients,
            req.logId
        );
    }),

    getClientById: asyncHandler(async (req, res) => {
        const validationResult = clientValidator.getById.validate(req.params);
        if (validationResult.error) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        const client = await clientServices.getById(req.params.id);
        if (!client) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Client not found',
                null,
                req.logId
            );
        }

        await sendResponse(
            res,
            responseStatusCodes.OK,
            'Client retrieved successfully',
            client,
            req.logId
        );
    }),

    deleteClient: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const deleted = await clientServices.deleteClient(id);
        if (!deleted) {
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Client not found',
                null,
                req.logId
            );
        }

        await sendResponse(
            res,
            responseStatusCodes.OK,
            'Client deleted successfully',
            null,
            req.logId
        );
    }),
};

module.exports = clientController;
