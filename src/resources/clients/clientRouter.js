const express = require('express');
const {
    createClient,
    updateClient,
    getAllClients,
    getClientById,
    deleteClient,
} = require('./clientController');

const clientRouter = express.Router();

clientRouter.route('/')
    .post(createClient) // Create a new client
    .get(getAllClients) // Get all clients
    .put(updateClient); // Update a client

clientRouter.route('/:id')
    .get(getClientById) // Get client by ID
    .delete(deleteClient); // Delete client by ID

module.exports = clientRouter;
