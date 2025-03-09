import express from "express";
import ShipperController from "../../controller/shipperController/shipperController";
import { ShipperService } from "../../services/shipper/shipperService";
import shipperRepositories from "../../repositories/implementaion/shipperRepositories";
import OtpRepository  from "../../repositories/implementaion/otpRepositories";

const shipperAuth_rote = express.Router()


const shipperService = new ShipperService(shipperRepositories, OtpRepository)
const shipperController = new ShipperController(shipperService);

shipperAuth_rote.post('/register',shipperController.SignUp.bind(shipperController));

shipperAuth_rote.post('/verifyOtp',shipperController.verifyOtp.bind(shipperController));

shipperAuth_rote.post('/resendOtp', shipperController.resendOtp.bind(shipperController));

shipperAuth_rote.post('/login', shipperController.signIn.bind(shipperController));

shipperAuth_rote.post('/logout', shipperController.Logout.bind(shipperController))


export default shipperAuth_rote;