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
);

const shipperController  = new ShipperController(shipperService);



shipper_route.get('/profile',authenticateToken,  shipperController.getProfileData.bind(shipperController));

shipper_route.post('/kycRegister', authenticateToken, upload.fields([{name: 'aadhaarFront'}, {name: 'aadhaarBack'}]), shipperController.registerKyc.bind(shipperController));

shipper_route.post('/postLoad', authenticateToken, shipperController.postLoad.bind(shipperController));

shipper_route.get('/getVerificationStatus', authenticateToken, shipperController.getVerificationstatus.bind(shipperController));

shipper_route.get('/fetchBids', authenticateToken, shipperController.fetchBids.bind(shipperController));

shipper_route.patch('/updateBidStatus', authenticateToken, shipperController.updateBidStatus.bind(shipperController));

shipper_route.get('/fetchLoads', authenticateToken, shipperController.fetchLoads.bind(shipperController));

shipper_route.post('/checkout-session', authenticateToken, shipperController.checkoutSession.bind(shipperController));

shipper_route.post('/verifyPayment', authenticateToken, shipperController.verifyPayment.bind(shipperController));

shipper_route.get('/trips', authenticateToken, shipperController.fetchTrips.bind(shipperController));

shipper_route.post('/updateProfile', authenticateToken, upload.fields([{name: 'profileImage'}]), shipperController.updateProfile.bind(shipperController));

shipper_route.get('/transporterDetails/:transporterId', authenticateToken, shipperController.fetchTransporterDetails.bind(shipperController));

shipper_route.post('/followTransporter', authenticateToken, shipperController.followTransporter.bind(shipperController));

shipper_route.post('/unfollowTransporter', authenticateToken, shipperController.unFollowTransporter.bind(shipperController));

shipper_route.post('/postReview', authenticateToken, shipperController.postReview.bind(shipperController));

shipper_route.get('/fetchTransporters', authenticateToken, shipperController.fetchTransportes.bind(shipperController));

shipper_route.get('/fetchTrucks', authenticateToken, shipperController.fetchTrucks.bind(shipperController));










export default shipper_route;