const clientModel = require('./clientModel');
const passwordServices = require('../../utils/passwordServices');

const clientServices = {
    create: async (data) => {
        try {

            const newClient = await clientModel.create(data);
            return newClient;
        } catch (error) {
            console.error('Error in client creation:', error);
            throw new Error('Failed to create client');
        }
    }
    ,
    update: async (clientId, data) => {
        delete data.clientId;
        if (data.password) {
            data.password = await passwordServices.hash(data.password, 12); // Rehash password if updated
        } else {
            delete data.password; // Keep the existing password if not provided
        }
        return await clientModel.findOneAndUpdate({ _id: clientId }, data, { new: true });
    },
    getAll: async () => {
        return await clientModel.find({}).populate({ path: 'createdBy', select: 'firstName lastName email' });
    },
    getById: async (id) => {
        return await clientModel.findById(id).populate({ path: 'createdBy', select: 'firstName lastName email' });
    },
    deleteClient: async (id) => {
        return await clientModel.findByIdAndDelete(id);
    },
};

module.exports = clientServices;
