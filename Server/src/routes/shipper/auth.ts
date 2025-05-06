import express from "express";
import ShipperController from "../../controller/shipperController/shipperController";
import { ShipperService } from "../../services/shipper/shipperService";
import shipperRepositories from "../../repositories/implementaion/shipperRepositories";
import OtpRepository  from "../../repositories/implementaion/otpRepositories";
import loadRepository from "../../repositories/implementaion/loadRepository";
import bidRepository from "../../repositories/implementaion/bidRepository";
import shipperPaymentRepository from "../../repositories/implementaion/shipperPaymentRepository";
import tripRepository from "../../repositories/implementaion/tripRepository";
import transporterRepository from "../../repositories/implementaion/transporterRepository";
import truckRepository from "../../repositories/implementaion/truckRepository";
import reviewRatingRepository from "../../repositories/implementaion/reviewRatingRepository";


const shipperAuth_rote = express.Router()


const shipperService = new ShipperService( 
    shipperRepositories, 
    OtpRepository, 
    loadRepository, 
    bidRepository, 
    shipperPaymentRepository, 
    tripRepository,
    transporterRepository,
    truckRepository,
    reviewRatingRepository
)


const shipperController = new ShipperController(shipperService);

shipperAuth_rote.post('/register',shipperController.SignUp.bind(shipperController));

shipperAuth_rote.post('/verifyOtp',shipperController.verifyOtp.bind(shipperController));

shipperAuth_rote.post('/resendOtp', shipperController.resendOtp.bind(shipperController));

shipperAuth_rote.post('/login', shipperController.signIn.bind(shipperController));

shipperAuth_rote.post('/logout', shipperController.Logout.bind(shipperController));

shipperAuth_rote.post('/forgotPassword', shipperController.forgotPassword.bind(shipperController));

shipperAuth_rote.post('/changePassword', shipperController.changePassword.bind(shipperController));

shipperAuth_rote.post('/googleLogin', shipperController.GoogleLogin.bind(shipperController));


export default shipperAuth_rote;