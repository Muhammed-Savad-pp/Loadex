import  express  from "express";
import { ShipperService } from "../../services/shipper/shipperService";
import shipperRepositories from "../../repositories/implementaion/shipperRepositories";
import otpRepositories from "../../repositories/implementaion/otpRepositories";
import ShipperController from "../../controller/shipperController/shipperController";
import authenticateToken from "../../Middleware/userAuth";
import multer from "multer";
import loadRepository from "../../repositories/implementaion/loadRepository";
import bidRepository from "../../repositories/implementaion/bidRepository";
import shipperPaymentRepository from "../../repositories/implementaion/shipperPaymentRepository";
import tripRepository from "../../repositories/implementaion/tripRepository";
import transporterRepository from "../../repositories/implementaion/transporterRepository";
import truckRepository from "../../repositories/implementaion/truckRepository";
import reviewRatingRepository from "../../repositories/implementaion/reviewRatingRepository";
import { checkRole } from "../../Middleware/checkRole";
import chatRepository from "../../repositories/implementaion/chatRepository";
import messageRepository from "../../repositories/implementaion/messageRepository";
import notificationRepository from "../../repositories/implementaion/notificationRepository";
import adminPaymentRepository from "../../repositories/implementaion/adminPaymentRepository";



const storage = multer.memoryStorage();
const upload = multer({storage});

const shipper_route = express.Router();

const shipperService = new ShipperService( 
    shipperRepositories,
    otpRepositories,
    loadRepository,
    bidRepository,
    shipperPaymentRepository,
    tripRepository,
    transporterRepository,
    truckRepository,
    reviewRatingRepository,
    chatRepository,
    messageRepository,
    notificationRepository,
    adminPaymentRepository
);

const shipperController  = new ShipperController(shipperService);



shipper_route.get('/profile',authenticateToken, checkRole('shipper'), shipperController.getProfileData.bind(shipperController));

shipper_route.post('/kycRegister', authenticateToken, checkRole('shipper'), upload.fields([{name: 'aadhaarFront'}, {name: 'aadhaarBack'}]), shipperController.registerKyc.bind(shipperController));

shipper_route.post('/postLoad', authenticateToken, checkRole('shipper'), shipperController.postLoad.bind(shipperController));

shipper_route.get('/VerificationStatus', authenticateToken, checkRole('shipper'), shipperController.getVerificationstatus.bind(shipperController));

shipper_route.get('/Bids', authenticateToken, checkRole('shipper'), shipperController.fetchBids.bind(shipperController));

shipper_route.patch('/BidStatus', authenticateToken, checkRole('shipper'), shipperController.updateBidStatus.bind(shipperController));

shipper_route.get('/Loads', authenticateToken, checkRole('shipper'), shipperController.fetchLoads.bind(shipperController));

shipper_route.post('/checkout-session', authenticateToken, checkRole('shipper'), shipperController.checkoutSession.bind(shipperController));

shipper_route.post('/verifyPayment', authenticateToken, checkRole('shipper'), shipperController.verifyPayment.bind(shipperController));

shipper_route.get('/trips', authenticateToken, checkRole('shipper'), shipperController.fetchTrips.bind(shipperController));

shipper_route.post('/Profile', authenticateToken, checkRole('shipper'), upload.fields([{name: 'profileImage'}]), shipperController.updateProfile.bind(shipperController));

shipper_route.get('/transporterDetails/:transporterId', authenticateToken, checkRole('shipper'), shipperController.fetchTransporterDetails.bind(shipperController));

shipper_route.post('/followTransporter', authenticateToken, checkRole('shipper'), shipperController.followTransporter.bind(shipperController));

shipper_route.post('/unfollowTransporter', authenticateToken, checkRole('shipper'), shipperController.unFollowTransporter.bind(shipperController));

shipper_route.post('/Review', authenticateToken, checkRole('shipper'), shipperController.postReview.bind(shipperController));

shipper_route.get('/transporters', authenticateToken, checkRole('shipper'), shipperController.fetchTransportes.bind(shipperController));

shipper_route.get('/trucks', authenticateToken, checkRole('shipper'), shipperController.fetchTrucks.bind(shipperController));

shipper_route.get('/subscriptionPlans', authenticateToken, checkRole('shipper'), shipperController.getShipperSubscriptionPlan.bind(shipperController))

shipper_route.post('/subscription/create-checkout-session', authenticateToken, checkRole('shipper'), shipperController.subscriptionCheckoutSession.bind(shipperController))

shipper_route.get('/subscription-success', authenticateToken, checkRole('shipper'), shipperController.handleSubscriptionSuccess.bind(shipperController));

shipper_route.put('/load', authenticateToken, checkRole('shipper'), shipperController.updateLoad.bind(shipperController));

shipper_route.delete('/load', authenticateToken, checkRole('shipper'), shipperController.deleteLoad.bind(shipperController));

shipper_route.post('/chat', authenticateToken, checkRole('shipper'), shipperController.createChat.bind(shipperController));

shipper_route.get('/chats', authenticateToken, checkRole('shipper'), shipperController.fetchChats.bind(shipperController))

shipper_route.get('/messages/:chatId', authenticateToken, checkRole('shipper'), shipperController.fetchMessages.bind(shipperController));

shipper_route.post('/message', authenticateToken, checkRole('shipper'), shipperController.sendMessage.bind(shipperController));

shipper_route.get('/me', authenticateToken, checkRole('shipper'), shipperController.getCurrentShipperId.bind(shipperController));

shipper_route.patch('/message-mark-as-read/:chatId', authenticateToken, checkRole('shipper'), shipperController.upateMessageAsRead.bind(shipperController))

shipper_route.get('/notifications', authenticateToken, checkRole('shipper'), shipperController.fetchNotifications.bind(shipperController))

shipper_route.patch('/notification-mark-as-read', authenticateToken, checkRole('shipper'), shipperController.updateNotificationAsRead.bind(shipperController));

shipper_route.delete('/notification/:notificationId', authenticateToken, checkRole('shipper'), shipperController.deleteNotification.bind(shipperController));

shipper_route.get('/paymentHistory', authenticateToken, checkRole('shipper'), shipperController.fetchpaymentHistory.bind(shipperController))

shipper_route.get('/unReadNotificationCount', authenticateToken, checkRole('shipper'), shipperController.findUnReadNotificationCount.bind(shipperController))

export default shipper_route;