// routes/meetingRoutes.js
const express = require('express');
const router = express.Router();
const meetingController = require('./meetingController');

// Route to create a meeting request
router.post('/', meetingController.create);

// Route to get  by client ID
router.get('/client/:clientId', meetingController.getByClient);

// Route to get  by admin ID
router.get('/admin/:adminId', meetingController.getByAdmin);

// Route to update meeting status
router.patch('/:meetingId/status', meetingController.updateStatus);

// Route to delete a meeting
router.delete('/:meetingId', meetingController.delete);

module.exports = router;
