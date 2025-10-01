import express from "express";
import { TruckSerice } from "../../services/truck/truckService";
import { TruckController } from "../../controller/truckController/truckController";
import truckRepository from "../../repositories/implementaion/truckRepository";
import authenticateToken from "../../Middleware/userAuth";
import { checkRole } from "../../Middleware/checkRole";
import transporterRepository from "../../repositories/implementaion/transporterRepository";
import multer from "multer";
import notificationRepository from "../../repositories/implementaion/notificationRepository";
import { validateDto } from "../../Middleware/validate-dto";
import { createTruckDto } from "../../dtos/truck/request/truck.dto";

const storage = multer.memoryStorage();
const upload = multer({storage})

const truck_route = express.Router()

const truckService = new TruckSerice(
    truckRepository,
    transporterRepository,
    notificationRepository
);

const truckController = new TruckController(truckService)

truck_route.get('/', authenticateToken, checkRole('transporter'), truckController.findTrucks.bind(truckController));
truck_route.post('/truck',authenticateToken, checkRole('transporter'), upload.fields([{name: 'rcBook'}, {name: 'driverLicense'}, {name: 'truckImage'}]), validateDto(createTruckDto),  truckController.registerTruck.bind(truckController));
truck_route.put('/activation/truck', authenticateToken, checkRole('transporter'), (req, res, next) => {
    req.body.driverLicense = req.body.driverLicense || ''; 
    next();
  }, upload.fields([{name: 'driverLicenseFile'}]), truckController.updateTruckAvailable.bind(truckController));
truck_route.get('/activeTruck', authenticateToken, checkRole('transporter'), truckController.fetchActiveTruck.bind(truckController));
truck_route.put('/truck', authenticateToken, checkRole('transporter'), upload.single('truckImage'), truckController.updateTruck.bind(truckController));
truck_route.get('/shipper', authenticateToken, checkRole('shipper'), truckController.fetchTrucksForShipper.bind(truckController));
truck_route.get('/requests/admin', authenticateToken, checkRole('admin'),  truckController.getRequestedTrucksForAdmin.bind(truckController));
truck_route.patch('/verification-status', authenticateToken, checkRole('admin'),  truckController.changeTruckVerificationStatusByAdmin.bind(truckController));





export default truck_route