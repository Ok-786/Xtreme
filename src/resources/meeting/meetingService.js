// services/meetingService.js
const MeetingModel = require('./meetingModel'); // Adjust the path as necessary

class MeetingService {
    // Create a new meeting request
    async createMeeting(clientId, adminId, meetingDate, meetingTime, notes) {
        try {
            const newMeeting = new MeetingModel({
                clientId,
                adminId,
                meetingDate,
                meetingTime,
                notes,
            });

            await newMeeting.save();

            // Logic to notify the admin goes here (e.g., sending an email)

            return newMeeting;
        } catch (error) {
            throw new Error(`Error requesting meeting: ${error.message}`);
        }
    }

    // Get all meetings by client ID
    async getMeetingsByClient(clientId) {
        try {
            return await MeetingModel.find({ clientId }).populate('adminId', 'firstName lastName'); // Adjust the fields as necessary
        } catch (error) {
            throw new Error(`Error fetching meetings: ${error.message}`);
        }
    }

    // Get all meetings by admin ID
    async getMeetingsByAdmin(adminId) {
        try {
            return await MeetingModel.find({ adminId }).populate('clientId', 'name'); // Adjust the fields as necessary
        } catch (error) {
            throw new Error(`Error fetching meetings: ${error.message}`);
        }
    }

    // Update meeting status
    async updateMeetingStatus(meetingId, status) {
        try {
            return await MeetingModel.findByIdAndUpdate(meetingId, { status }, { new: true });
        } catch (error) {
            throw new Error(`Error updating meeting status: ${error.message}`);
        }
    }

    // Delete a meeting
    async deleteMeeting(meetingId) {
        try {
            await MeetingModel.findByIdAndDelete(meetingId);
            return { message: 'Meeting deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting meeting: ${error.message}`);
        }
    }
}

module.exports = new MeetingService();
