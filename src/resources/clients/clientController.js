const asyncHandler = require('express-async-handler');
const clientServices = require('./clientService');
const sendResponse = require('../../utils/sendResponse');
const clientValidator = require('./clientValidator');
const clientModel = require('./clientModel')
const responseStatusCodes = require('../../constants/responseStatusCodes');
const passwordServices = require('../../utils/passwordServices');
const adminUserModel = require('../adminUser/adminUserModel');
const notificationService = require('../notifications/notificationService');
const { Subscription } = require('../subscription/subscriptionModel')
const messageModel = require('../message/messageModel');
const systemNotification = require('../systemNotifications/systemNotification');
const uploadFile = require('../../utils/uploadFile')
const Note = require('../clientNotes/clientNoteModel');
const CheckinStatus = require('../checkInStatus/checkInStatusModel');
const ProgressImage = require('../clientProgressImages/progressImageModel');
const DailyWellness = require('../dailyWellness/dailyWellnessModel');
const BodyMetrics = require('../bodyMetrics/bodyMetricsModel');
const WorkoutPlan = require('../workout/workoutPlanModel');
const ClientMealPlan = require('../clientMealPlan/clientMealPlanModel')
const moment = require('moment');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: process.env.MAILHOST,
    port: process.env.MAILPORT,
    secure: true,
    auth: {
        user: process.env.MAILFROM,
        pass: process.env.MAILPASS,
    },
});

const generateOTP = () => {
    return Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit OTP
};
const clientController = {



    createClient: asyncHandler(async (req, res) => {
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

        // console.log("email", req.body.email);
        const dup = await clientModel.findOne({ email: req.body.email });
        // console.log("dup", dup)
        if (dup) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                `Email already exists: ${req.body.email}`,
                null,
                req.logId
            );
        }
        const existingAdminUser = await adminUserModel.findOne({ email: req.body.email });
        if (existingAdminUser) {
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                'Email already exists in Admin Users',
                null,
                req.logId
            );
        }

        req.body.password = await passwordServices.hash(req.body.password, 12);
        if (req.body.profilePicture) {
            req.body.profilePicture = await uploadFile(req.body.profilePicture)
        }

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
    requestPlan: asyncHandler(async (req, res) => {
        const { clientId, planType, startDate, endDate } = req.body;


        if (!['workout', 'meal'].includes(planType)) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'Invalid plan type. Must be "workout" or "meal".'
            );
        }

        const client = await clientModel.findById(clientId);
        if (!client) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Client not found'
            );
        }

        const updatedClient = await clientServices.requestPlan(clientId, planType, startDate, endDate);
        if (!updatedClient) {
            return sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Client not found'
            );
        }

        const admins = await adminUserModel.find();
        const notificationPromises = admins.map(async (admin) => {
            const notificationData = {
                title: 'New Plan Request',
                body: `${planType.charAt(0).toUpperCase() + planType.slice(1)} plan requested by a client.`,
                message: `Client ${client.name} has requested a ${planType} plan.`,
                clientId: clientId,
                adminId: admin._id,
            };


            await notificationService.createNotification(notificationData);


            const fcmToken = admin.fcmToken;
            if (fcmToken) {
                await systemNotification.systemNotification(
                    notificationData.body,
                    notificationData.title,
                    fcmToken,
                    { clientId, clientName: client.name, planType }
                );
            }
        });


        const clientFcmToken = client.fcmToken;
        if (clientFcmToken) {
            await systemNotification.systemNotification(
                `Your request for a ${planType} plan has been submitted successfully.`,
                'Plan Request Submitted',
                clientFcmToken,
                { clientId, planType }
            );
        }

        // Execute all notification promises
        await Promise.all(notificationPromises);

        return sendResponse(
            res,
            responseStatusCodes.OK,
            `${planType.charAt(0).toUpperCase() + planType.slice(1)} plan requested successfully`,
            updatedClient
        );
    })
    ,
    changePassword: asyncHandler(async (req, res) => {
        const { currentPassword, newPassword, userId } = req.body;
        if (!currentPassword || !newPassword) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'Current password and new password are required.',
                null,
                req.logId
            );
        }

        const client = await clientModel.findById(userId);
        if (!client) {
            console.error('Client not found:', userId);
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'Client not found.',
                null,
                req.logId
            );
        }

        const isPasswordValid = await passwordServices.compare(currentPassword, client.password);
        if (!isPasswordValid) {
            console.error('Invalid current password for user:', client._id);
            return sendResponse(
                res,
                responseStatusCodes.UNAUTHORIZED,
                'Current password is incorrect.',
                null,
                req.logId
            );
        }

        const hashedPassword = await passwordServices.hash(newPassword, 12);
        console.log('New hashed password:', hashedPassword);

        client.password = hashedPassword;
        await client.save();
        console.log('Password updated for client:', client._id);

        return sendResponse(
            res,
            responseStatusCodes.OK,
            'Password changed successfully.',
            null,
            req.logId
        );
    }),
    changePasswordByEmail: asyncHandler(async (req, res) => {
        const { email, newPassword } = req.body;


        if (!email || !newPassword) {
            return sendResponse(
                res,
                responseStatusCodes.BAD,
                'Email and new password are required.',
                null,
                req.logId
            );
        }

        const client = await clientModel.findOne({ email });
        if (client) {
            const hashedPassword = await passwordServices.hash(newPassword, 12);
            console.log('New hashed password for client email:', email, hashedPassword);
            client.password = hashedPassword;
            await client.save();
            console.log('Password updated for client with email:', email);

            return sendResponse(
                res,
                responseStatusCodes.OK,
                'Password changed successfully for client.',
                null,
                req.logId
            );
        }

        const admin = await adminUserModel.findOne({ email });
        if (admin) {
            const hashedPassword = await passwordServices.hash(newPassword, 12);
            console.log('New hashed password for admin email:', email, hashedPassword);
            admin.password = hashedPassword;
            await admin.save();
            console.log('Password updated for admin with email:', email);

            return sendResponse(
                res,
                responseStatusCodes.OK,
                'Password changed successfully for admin.',
                null,
                req.logId
            );
        }
        console.error('User not found with email:', email);
        return sendResponse(
            res,
            responseStatusCodes.BAD,
            'User not found.',
            null,
            req.logId
        );
    }),


    updateClient: asyncHandler(async (req, res) => {
        console.log("Request Body:", req.body);

        const validationResult = clientValidator.update.validate(req.body);
        if (validationResult.error) {
            console.log("Validation Error:", validationResult.error.details[0].message);
            return await sendResponse(
                res,
                responseStatusCodes.BAD,
                validationResult.error.details[0].message,
                null,
                req.logId
            );
        }

        console.log("Attempting to update client with ID:", req.body.clientId);
        if (req.body.profilePicture) {
            req.body.profilePicture = await uploadFile(req.body.profilePicture)
        }
        const updatedClient = await clientServices.update(req.body.clientId, req.body);
        if (!updatedClient) {
            console.log("Client not found for ID:", req.body.clientId);
            return await sendResponse(
                res,
                responseStatusCodes.NOTFOUND,
                'Client not found',
                null,
                req.logId
            );
        }

        console.log("Client updated successfully:", updatedClient);
        return await sendResponse(
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
        return await sendResponse(
            res,
            responseStatusCodes.OK,
            'Clients retrieved successfully',
            clients,
            req.logId
        );
    }),

    dashboard: asyncHandler(async (req, res) => {
        const { id: clientId } = req.params;
        const { frequency = 'weekly', date } = req.query;

        try {
            const now = moment();
            const startOfWeek = now.startOf('week').toDate();
            const endOfWeek = now.endOf('week').toDate();

            let bodyMetricsData;

            if (frequency === 'daily') {
                const dailyData = [];
                for (let i = 0; i < 5; i++) {
                    const targetDate = now.subtract(i, 'days').startOf('day').toDate();
                    const nextDay = moment(targetDate).endOf('day').toDate();

                    const dailyMetric = await BodyMetrics.findOne({
                        clientId,
                        createdAt: { $gte: targetDate, $lte: nextDay },
                    });

                    dailyData.unshift({
                        date: targetDate,
                        weight: dailyMetric ? dailyMetric.weight : 0,
                    });
                }
                bodyMetricsData = dailyData;
            } else if (frequency === 'weekly') {
                const weeklyData = [];
                for (let i = 0; i < 5; i++) {
                    const startOfWeek = now.subtract(i, 'week').startOf('week').toDate();
                    const endOfWeek = moment(startOfWeek).endOf('week').toDate();

                    const weeklyMetrics = await BodyMetrics.find({
                        clientId,
                        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
                    });

                    if (weeklyMetrics.length > 0) {
                        const avgWeight =
                            weeklyMetrics.reduce((sum, metric) => sum + metric.weight, 0) / weeklyMetrics.length;
                        weeklyData.unshift({
                            week: `Week ${5 - i}`,
                            avgWeight,
                        });
                    } else {
                        weeklyData.unshift({
                            week: `Week ${5 - i}`,
                            avgWeight: 0,
                        });
                    }
                }
                bodyMetricsData = weeklyData;
            } else if (frequency === 'monthly') {
                const monthlyData = [];
                for (let i = 0; i < 5; i++) {
                    const startOfMonth = now.subtract(i, 'month').startOf('month').toDate();
                    const endOfMonth = moment(startOfMonth).endOf('month').toDate();

                    const monthlyMetrics = await BodyMetrics.find({
                        clientId,
                        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
                    });

                    if (monthlyMetrics.length > 0) {
                        const avgWeight =
                            monthlyMetrics.reduce((sum, metric) => sum + metric.weight, 0) / monthlyMetrics.length;
                        monthlyData.unshift({
                            month: `Month ${5 - i}`,
                            avgWeight,
                        });
                    } else {
                        monthlyData.unshift({
                            month: `Month ${5 - i}`,
                            avgWeight: 0,
                        });
                    }
                }
                bodyMetricsData = monthlyData;
            }
            let dailyWellnessData;
            if (date) {
                const wellnessDate = moment(date, 'YYYY-MM-DD').startOf('day').toDate();
                dailyWellnessData = await DailyWellness.findOne({
                    clientId,
                    createdAt: { $gte: wellnessDate, $lte: moment(wellnessDate).endOf('day').toDate() },
                });
            } else {
                dailyWellnessData = await DailyWellness.findOne({ clientId }).sort({ createdAt: -1 });
            }

            const [
                latestNote,
                latestCheckin,
                latestProgressImage,
                MeasurementCount,
                workoutPlans,
                mealPlans,
                currentWeekMetrics,
                currentWeekCheckins,
                totalWorkouts
            ] = await Promise.all([
                Note.find({ clientId }).sort({ createdAt: -1 }).populate('clientId', 'name profilePicture'),
                CheckinStatus.findOne({ clientId }).sort({ createdAt: -1 }),
                ProgressImage.find({ clientId }).sort({ createdAt: -1 }),
                BodyMetrics.findOne({ clientId }).sort({ createdAt: -1 }),
                WorkoutPlan.find({ clientId, date: { $gte: startOfWeek, $lte: endOfWeek } }),
                ClientMealPlan.find({ clientId, date: { $gte: startOfWeek, $lte: endOfWeek } }),
                BodyMetrics.find({ clientId, createdAt: { $gte: startOfWeek, $lte: endOfWeek } }),
                CheckinStatus.find({ clientId, createdAt: { $gte: startOfWeek, $lte: endOfWeek } }),
                WorkoutPlan.find({ clientId }),
            ]);

            const currentWeekAverages = {
                weightLoss: currentWeekMetrics.length
                    ? currentWeekMetrics.reduce((sum, metric) => sum + metric.weightLoss, 0) / currentWeekMetrics.length
                    : 0,
                muscleGain: currentWeekMetrics.length
                    ? currentWeekMetrics.reduce((sum, metric) => sum + metric.muscleGain, 0) / currentWeekMetrics.length
                    : 0,
                caloriesBurned: currentWeekMetrics.length
                    ? currentWeekMetrics.reduce((sum, metric) => sum + metric.caloriesBurned, 0) / currentWeekMetrics.length
                    : 0,
            };

            currentWeekAverages.activeMinutes = currentWeekCheckins.reduce((total, checkin) => {
                if (checkin.checkinTime && checkin.checkoutTime) {
                    const minutes = moment(checkin.checkoutTime).diff(moment(checkin.checkinTime), 'minutes');
                    return total + minutes;
                }
                return total;
            }, 0);

            const completedWorkouts = totalWorkouts.filter(workout => workout.status === 'Completed');
            const workoutStats = {
                totalWorkouts: totalWorkouts.length,
                completedWorkouts: completedWorkouts.length,
                completionPercentage: totalWorkouts.length
                    ? ((completedWorkouts.length / totalWorkouts.length) * 100).toFixed(2)
                    : 0,
            };

            const activity = {
                workoutPlans: workoutPlans.map(plan => ({
                    day: plan.day,
                    date: plan.date,
                    status: plan.status,
                })),
                mealPlans: mealPlans.map(plan => ({
                    day: plan.day,
                    date: plan.date,
                    status: plan.status,
                })),
            };

            const dashboardData = {
                latestNote,
                latestCheckin,
                latestProgressImage,
                dailyWellness: dailyWellnessData,
                MeasurementCount,
                activity,
                MeasurementOnFrequency: bodyMetricsData,
                currentWeekAverages,
                workoutStats,
            };

            return sendResponse(
                res,
                responseStatusCodes.OK,
                'Dashboard data retrieved successfully',
                dashboardData,
                req.logId
            );
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return sendResponse(
                res,
                responseStatusCodes.SERVER,
                'Failed to retrieve dashboard data',
                null,
                req.logId
            );
        }
    })
    ,
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

        return await sendResponse(
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

        return await sendResponse(
            res,
            responseStatusCodes.OK,
            'Client deleted successfully',
            null,
            req.logId
        );
    }),
    clientInsightsController: asyncHandler(async (req, res) => {
        const currentDate = new Date();
        const fiveDaysAgo = new Date(currentDate);
        fiveDaysAgo.setDate(currentDate.getDate() - 5);
        const lastMonth = new Date(currentDate);
        lastMonth.setMonth(currentDate.getMonth() - 1);
        const twoDaysAgo = new Date(currentDate);
        twoDaysAgo.setDate(currentDate.getDate() - 2);
        const endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 7);

        try {
            const activeClientsCount = await clientModel.countDocuments({ isActive: true });

            const recentCheckinsCount = await clientModel.countDocuments({
                isActive: true,
                lastLogin: { $gte: fiveDaysAgo, $lte: currentDate }
            });

            const newClientsCount = await clientModel.countDocuments({
                createdAt: { $gte: lastMonth, $lte: currentDate }
            });

            const endingSoonSubscriptions = await Subscription.countDocuments({
                expirationDate: { $gte: currentDate, $lte: endDate },
                clientId: { $type: 'objectId' }
            });

            const newMessagesCount = await messageModel.countDocuments({
                receiverModel: 'AdminUser',
                createdAt: { $gte: twoDaysAgo, $lte: currentDate }
            });

            const latestCheckins = await CheckinStatus.find({})
                .sort({ checkinTime: -1 })
                .limit(10)
                .populate('clientId', 'name email profilePicture')
                .lean();

            const latestCheckinsWithProgressImages = await Promise.all(
                latestCheckins.map(async (checkin) => {
                    const progressImages = await ProgressImage.findOne({ clientId: checkin.clientId._id })
                        .sort({ updatedAt: -1 })
                        .lean();

                    return {
                        clientName: checkin.clientId.name,
                        clientEmail: checkin.clientId.email,
                        profilePicture: checkin.clientId.profilePicture,
                        checkinTime: checkin.checkinTime,
                        checkoutTime: checkin.checkoutTime,
                        progressImages: progressImages ? progressImages.images : [],
                    };
                })
            );

            const completedWorkouts = await WorkoutPlan.find({ status: 'Completed' })
                .sort({ updatedAt: -1 })
                .populate('clientId', 'name profilePicture')
                .lean();

            const workoutActivityFeed = completedWorkouts.map((workout) => ({
                clientName: workout.clientId.name,
                profilePicture: workout.clientId.profilePicture,
                workoutDate: workout.date,
                workoutDetails: workout.exercises.map((exercise) => ({
                    exerciseId: exercise.exerciseId,
                    intensity: exercise.intensity,
                    duration: exercise.duration,
                    sets: exercise.sets,
                    reps: exercise.reps,
                })),
            }));

            const getMonthlyClientStatusCount = await clientServices.getMonthlyClientStatusCount();
            const getCounts = await clientServices.getCounts();

            return sendResponse(
                res,
                responseStatusCodes.OK,
                'Client insights retrieved successfully',
                {
                    activeClients: activeClientsCount,
                    recentCheckins: recentCheckinsCount,
                    newClients: newClientsCount,
                    endingSoonSubscriptions,
                    newMessages: newMessagesCount,
                    statusCount: getMonthlyClientStatusCount,
                    counts: getCounts,
                    latestCheckins: latestCheckinsWithProgressImages,
                    workoutActivityFeed,
                }
            );
        } catch (error) {
            console.error('Error retrieving client insights:', error);
            return sendResponse(
                res,
                responseStatusCodes.SERVER,
                'Failed to retrieve client insights'
            );
        }
    }),
    sendOTP: asyncHandler(async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return sendResponse(res, responseStatusCodes.BAD, 'Email is required.', null);
        }


        const client = await clientModel.findOne({ email });
        const admin = await adminUserModel.findOne({ email });

        if (!client && !admin) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'User not found.', null);
        }

        const user = client || admin;
        const userType = client ? 'Client' : 'Admin';
        const otp = generateOTP();
        const otpExpiry = moment().add(10, 'minutes').toDate();

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        const mailOptions = {
            from: `Xtreme Fitness <${process.env.MAILFROM}>`,
            to: email,
            subject: `Your OTP for Xtreme Fitness (${userType})`,
            html: `
            <html>
                <body>
                    <div style="font-family: Arial, sans-serif; text-align: center;">
                        <h2>Your OTP Code</h2>
                        <p>Hi ${userType},</p>
                        <p>Your OTP is: <strong>${otp}</strong></p>
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you did not request this, please ignore this email.</p>
                    </div>
                </body>
            </html>
        `,
        };

        try {
            await transporter.sendMail(mailOptions);
            return sendResponse(res, responseStatusCodes.OK, `${userType} OTP sent successfully.`, null);
        } catch (error) {
            console.error('Error sending OTP email:', error);
            return sendResponse(res, responseStatusCodes.SERVER, 'Failed to send OTP email.', null);
        }
    })
    ,

    validateOTP: asyncHandler(async (req, res) => {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return sendResponse(res, responseStatusCodes.BAD, 'Email and OTP are required.', null);
        }


        const client = await clientModel.findOne({ email });
        const admin = await adminUserModel.findOne({ email });

        if (!client && !admin) {
            return sendResponse(res, responseStatusCodes.NOTFOUND, 'User not found.', null);
        }

        const user = client || admin;
        const userType = client ? 'Client' : 'Admin';

        if (user.otp !== otp) {
            return sendResponse(res, responseStatusCodes.BAD, 'Invalid OTP.', null);
        }

        if (moment().isAfter(user.otpExpiry)) {
            return sendResponse(res, responseStatusCodes.BAD, 'OTP has expired.', null);
        }


        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return sendResponse(res, responseStatusCodes.OK, `${userType} OTP validated successfully.`, null);
    }),

}

module.exports = clientController;
