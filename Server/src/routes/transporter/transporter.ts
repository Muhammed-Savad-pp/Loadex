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
)
const transporterController = new TransporterController(transporterService);

transporter_route.get('/getVerificationStatus', authenticateToken, transporterController.verificationStatus.bind(transporterController))

transporter_route.get('/profile', authenticateToken, transporterController.getProfileData.bind(transporterController));

transporter_route.post('/kyc', authenticateToken, upload.fields([{name: 'aadhaarFront'} , {name: 'aadhaarBack'}]) ,transporterController.kycVerification.bind(transporterController));

transporter_route.post('/registerTruck', authenticateToken, upload.fields([{name: 'rcBook'}, {name: 'driverLicense'}]),  transporterController.registerTruck.bind(transporterController));

transporter_route.get('/fetchLoads', authenticateToken, transporterController.fetchLoads.bind(transporterController));

transporter_route.get('/fetchTrucks', authenticateToken, transporterController.findTrucks.bind(transporterController));

transporter_route.put('/activateTruck', authenticateToken, (req, res, next) => {
    // Extract non-file fields before Multer processes
    req.body.driverLicense = req.body.driverLicense || ''; 
    next();
  }, upload.fields([{name: 'driverLicenseFile'}]), transporterController.updateTruckAvailable.bind(transporterController));


transporter_route.post('/sendBid', authenticateToken, transporterController.sendBid.bind(transporterController));

transporter_route.get('/fetchBids' ,authenticateToken, transporterController.fetchBids.bind(transporterController));

transporter_route.post('/bid-checkout-session', authenticateToken, transporterController.bidCheckoutSession.bind(transporterController));

transporter_route.post('/payment-bid-verification', authenticateToken, transporterController.verifyBidPayment.bind(transporterController));

transporter_route.get('/trips', authenticateToken, transporterController.fetchTrips.bind(transporterController));

transporter_route.patch('/trip-status', authenticateToken, transporterController.updateTripStatus.bind(transporterController));

transporter_route.post('/updateProfile', authenticateToken, upload.fields([{name: 'profileImage'}]), transporterController.updateProfile.bind(transporterController));

transporter_route.get('/shipperProfileData/:shipperId', authenticateToken, transporterController.fetchShipperProfileData.bind(transporterController));

transporter_route.post('/followShipper', authenticateToken, transporterController.followShipper.bind(transporterController));

transporter_route.post('/unfollowShipper', authenticateToken, transporterController.unfollowShipper.bind(transporterController));

transporter_route.post('/postReview', authenticateToken, transporterController.postReview.bind(transporterController));

transporter_route.get('/fetchShippers', authenticateToken, transporterController.fetchShippers.bind(transporterController));















export default transporter_route