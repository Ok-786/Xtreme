// controllers/meetingController.js
const meetingService = require('./meetingService');
const meetingValidator = require('./meetingValidator');


class MeetingController {
    async create(req, res) {
        try {
            await meetingValidator.create.validateAsync(req.body);
            const { clientId, adminId, meetingDate, meetingTime, notes } = req.body;
            const meeting = await meetingService.createMeeting(clientId, adminId, meetingDate, meetingTime, notes);
            return sendResponse(res, 201, 'Meeting created successfully', meeting);
        } catch (error) {
            return sendResponse(res, 400, error.message);
        }
    }

    async getByClient(req, res) {
        try {
            await meetingValidator.getByClient.validateAsync(req.params);
            const { clientId } = req.params;
            const meetings = await meetingService.getMeetingsByClient(clientId);
            return sendResponse(res, 200, 'Meetings retrieved successfully', meetings);
        } catch (error) {
            return sendResponse(res, 400, error.message);
        }
    }

    async getByAdmin(req, res) {
        try {
            await meetingValidator.getByAdmin.validateAsync(req.params);
            const { adminId } = req.params;
            const meetings = await meetingService.getMeetingsByAdmin(adminId);
            return sendResponse(res, 200, 'Meetings retrieved successfully', meetings);
        } catch (error) {
            return sendResponse(res, 400, error.message);
        }
    }

    async updateStatus(req, res) {
        try {
            await meetingValidator.updateStatus.validateAsync(req.body);
            const { meetingId } = req.params;
            const { status } = req.body;
            const updatedMeeting = await meetingService.updateMeetingStatus(meetingId, status);
            return sendResponse(res, 200, 'Meeting status updated successfully', updatedMeeting);
        } catch (error) {
            return sendResponse(res, 400, error.message);
        }
    }

    async delete(req, res) {
        try {
            await meetingValidator.delete.validateAsync(req.params);
            const { meetingId } = req.params;
            await meetingService.deleteMeeting(meetingId);
            return sendResponse(res, 200, 'Meeting deleted successfully');
        } catch (error) {
            return sendResponse(res, 400, error.message);
        }
    }
}


module.exports = new MeetingController();
