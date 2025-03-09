import  express  from "express";
import { ShipperService } from "../../services/shipper/shipperService";
import shipperRepositories from "../../repositories/implementaion/shipperRepositories";
import otpRepositories from "../../repositories/implementaion/otpRepositories";
import ShipperController from "../../controller/shipperController/shipperController";
import authenticateToken from "../../Middleware/userAuth";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({storage});

const shipper_route = express.Router();

const shipperService = new ShipperService(shipperRepositories, otpRepositories);
const shipperController  = new ShipperController(shipperService);



shipper_route.get('/profile',authenticateToken,  shipperController.getProfileData.bind(shipperController));
shipper_route.post('/kycRegister', authenticateToken, upload.fields([{name: 'aadhaarFront'}, {name: 'aadhaarBack'}]), shipperController.registerKyc.bind(shipperController) )





export default shipper_route;