import express  from "express";
import multer from "multer";
import {TransporterController} from "../../controller/transporterController/transporterController";
import authenticateToken from "../../Middleware/userAuth";
import { TransporterService } from "../../services/transporter/transporterService";
import transporterRepository from "../../repositories/implementaion/transporterRepository";


const storage = multer.memoryStorage();
const upload = multer({storage})

const transporter_route = express.Router();

const transporterService = new TransporterService(transporterRepository)
const transporterController = new TransporterController(transporterService);

transporter_route.get('/getVerificationStatus', authenticateToken, transporterController.verificationStatus.bind(transporterController))

transporter_route.get('/profile', authenticateToken, transporterController.getProfileData.bind(transporterController));

transporter_route.post('/kyc', authenticateToken, upload.fields([{name: 'aadhaarFront'} , {name: 'aadhaarBack'}]) ,transporterController.kycVerification.bind(transporterController));

transporter_route.post('/registerTruck', authenticateToken, upload.fields([{name: 'rcBook'}, {name: 'driverLicense'}]),  transporterController.registerTruck.bind(transporterController))



export default transporter_route