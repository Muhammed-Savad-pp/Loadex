import express  from "express";
import multer from "multer";
import {TransporterController} from "../../controller/transporterController/transporterController";
import authenticateToken from "../../Middleware/userAuth";
import { TransporterService } from "../../services/transporter/transporterService";
import transporterRepository from "../../repositories/implementaion/transporterRepository";
import truckRepository from "../../repositories/implementaion/truckRepository";
import bidRepository from "../../repositories/implementaion/bidRepository";
import loadRepository from "../../repositories/implementaion/loadRepository";
import TransporterPaymentRepository from "../../repositories/implementaion/TransporterPaymentRepository";
import tripRepository from "../../repositories/implementaion/tripRepository";
import shipperRepositories from "../../repositories/implementaion/shipperRepositories";
import reviewRatingRepository from "../../repositories/implementaion/reviewRatingRepository";
import chatRepository from "../../repositories/implementaion/chatRepository";
import messageRepository from "../../repositories/implementaion/messageRepository";
import { checkRole } from "../../Middleware/checkRole";
import notificationRepository from "../../repositories/implementaion/notificationRepository";
import transporterWalletRepository from "../../repositories/implementaion/transporterWalletRepository";
import adminPaymentRepository from "../../repositories/implementaion/adminPaymentRepository";

const storage = multer.memoryStorage();
const upload = multer({storage})

const transporter_route = express.Router();

const transporterService = new TransporterService(
  transporterRepository,
  truckRepository, 
  bidRepository, 
  loadRepository, 
  TransporterPaymentRepository, 
  tripRepository,
  shipperRepositories,
  reviewRatingRepository,
  chatRepository,
  messageRepository,
  notificationRepository,
  transporterWalletRepository,
  adminPaymentRepository
)
const transporterController = new TransporterController(transporterService);

transporter_route.get('/getVerificationStatus', authenticateToken, checkRole('transporter'), transporterController.verificationStatus.bind(transporterController))

transporter_route.get('/profile', authenticateToken, checkRole('transporter'), transporterController.getProfileData.bind(transporterController));

transporter_route.post('/kyc', authenticateToken, checkRole('transporter'), upload.fields([{name: 'aadhaarFront'} , {name: 'aadhaarBack'}]) ,transporterController.kycVerification.bind(transporterController));

transporter_route.post('/truck', authenticateToken, checkRole('transporter'), upload.fields([{name: 'rcBook'}, {name: 'driverLicense'}, {name: 'truckImage'}]),  transporterController.registerTruck.bind(transporterController));

transporter_route.get('/loads', authenticateToken, checkRole('transporter'), transporterController.fetchLoads.bind(transporterController));

transporter_route.get('/trucks', authenticateToken, checkRole('transporter'), transporterController.findTrucks.bind(transporterController));

transporter_route.put('/activateTruck', authenticateToken, checkRole('transporter'), (req, res, next) => {
    // Extract non-file fields before Multer processes
    req.body.driverLicense = req.body.driverLicense || ''; 
    next();
  }, upload.fields([{name: 'driverLicenseFile'}]), transporterController.updateTruckAvailable.bind(transporterController));


transporter_route.post('/sendBid', authenticateToken, checkRole('transporter'), transporterController.sendBid.bind(transporterController));

transporter_route.get('/bids' ,authenticateToken, checkRole('transporter'), transporterController.fetchBids.bind(transporterController));

transporter_route.post('/bid-checkout-session', authenticateToken, checkRole('transporter'), transporterController.bidCheckoutSession.bind(transporterController));

transporter_route.post('/payment-bid-verification', authenticateToken,  checkRole('transporter'), transporterController.verifyBidPayment.bind(transporterController));

transporter_route.get('/trips', authenticateToken, checkRole('transporter'), transporterController.fetchTrips.bind(transporterController));

transporter_route.patch('/trip-status', authenticateToken, checkRole('transporter'), transporterController.updateTripStatus.bind(transporterController));

transporter_route.post('/profile', authenticateToken, checkRole('transporter'), upload.fields([{name: 'profileImage'}]), transporterController.updateProfile.bind(transporterController));

transporter_route.get('/shipperProfileData/:shipperId', authenticateToken, checkRole('transporter'), transporterController.fetchShipperProfileData.bind(transporterController));

transporter_route.post('/followShipper', authenticateToken, checkRole('transporter'), transporterController.followShipper.bind(transporterController));

transporter_route.post('/unfollowShipper', authenticateToken, checkRole('transporter'), transporterController.unfollowShipper.bind(transporterController));

transporter_route.post('/review', authenticateToken, checkRole('transporter'), transporterController.postReview.bind(transporterController));

transporter_route.get('/shippers', authenticateToken, checkRole('transporter'), transporterController.fetchShippers.bind(transporterController));

transporter_route.get('/followersDetails', authenticateToken, checkRole('transporter'), transporterController.fetchFollowersAndFollowings.bind(transporterController));

transporter_route.get('/subscriptionPlans', authenticateToken, checkRole('transporter'), transporterController.fetchSubscriptionPlans.bind(transporterController));

transporter_route.post('/subscription/create-checkout-session', authenticateToken, checkRole('transporter'), transporterController.subscriptionCheckoutSession.bind(transporterController))

transporter_route.put('/subscription-success', authenticateToken, checkRole('transporter'), transporterController.subscriptionSuccess.bind(transporterController))

transporter_route.get('/activeTruck', authenticateToken, checkRole('transporter'), transporterController.fetchActiveTruck.bind(transporterController));

transporter_route.put('/bid', authenticateToken, checkRole('transporter'), transporterController.updateBid.bind(transporterController))

transporter_route.delete('/bid', authenticateToken, checkRole('transporter'), transporterController.deleteBidById.bind(transporterController));

transporter_route.get('/paymentHistory', authenticateToken, checkRole('transporter'), transporterController.fetchPaymentHistory.bind(transporterController));

transporter_route.post('/chat', authenticateToken, checkRole('transporter'), transporterController.createChat.bind(transporterController))

transporter_route.get('/chats', authenticateToken, checkRole('transporter'), transporterController.fetchChat.bind(transporterController))

transporter_route.post('/message', authenticateToken, checkRole('transporter'), transporterController.sendMessage.bind(transporterController))

transporter_route.get('/messages/:chatId', authenticateToken, checkRole('transporter'), transporterController.fetchMessages.bind(transporterController))

transporter_route.get('/me', authenticateToken, checkRole('transporter'), transporterController.fetchCurrentTransporterId.bind(transporterController))

transporter_route.patch('/mark-messsage-as-read/:chatId', authenticateToken, checkRole('transporter'), transporterController.updateMessageAsRead.bind(transporterController))

transporter_route.get('/notifications', authenticateToken, checkRole('transporter'), transporterController.fetchNotifications.bind(transporterController))

transporter_route.patch('/notification-mark-as-read', authenticateToken, checkRole('transporter'), transporterController.updateNotificationAsRead.bind(transporterController))

transporter_route.delete('/notification/:notificationId', authenticateToken, checkRole('transporter'), transporterController.deleteNotification.bind(transporterController))

transporter_route.get('/wallet', authenticateToken, checkRole('transporter'), transporterController.fetchWalletData.bind(transporterController))

transporter_route.post('/bidPaymentByWallet', authenticateToken, checkRole('transporter'), transporterController.bidPaymentByWallet.bind(transporterController))

transporter_route.get('/unreadNotificationCount', authenticateToken, checkRole('transporter'), transporterController.findUnreadNotificationCount.bind(transporterController))

transporter_route.put('/truck', authenticateToken, checkRole('transporter'), upload.single('truckImage'), transporterController.updateTruck.bind(transporterController))


export default transporter_route