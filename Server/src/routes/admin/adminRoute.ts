import  express  from "express";
import { AdminController } from "../../controller/adminController/adminController";
import { AdminService } from "../../services/admin/adminService";
import authenticateToken from "../../Middleware/userAuth";
import transporterRepositories from "../../repositories/implementaion/transporterRepository";
import shipperRepositories from "../../repositories/implementaion/shipperRepositories";
import loadRepository from "../../repositories/implementaion/loadRepository";
import truckRepository from "../../repositories/implementaion/truckRepository";


const admin_route = express.Router()

const adminService = new AdminService(transporterRepositories, shipperRepositories, loadRepository, truckRepository)
const adminController = new AdminController(adminService)


admin_route.post('/login', adminController.login.bind(adminController));
admin_route.get('/transporters',authenticateToken, adminController.getTransporter.bind(adminController));
admin_route.post('/logout', adminController.logout.bind(adminController));
admin_route.patch('/transporterBlockandUnblock', authenticateToken,  adminController.updateTransporterBlockandUnblock.bind(adminController));
admin_route.get('/fetchRequestTransporter', authenticateToken, adminController.getRequestedTransporters.bind(adminController));
admin_route.patch('/changeVerificationStatus', authenticateToken,  adminController.changeVerificationStatus.bind(adminController));
admin_route.get('/fetchShipper', authenticateToken, adminController.getShipper.bind(adminController));
admin_route.patch('/changeShipperStatus', authenticateToken, adminController.changeShipperStatus.bind(adminController));
admin_route.get('/fetchRequestShipper', authenticateToken, adminController.getRequestedShipper.bind(adminController));
admin_route.patch('/changeShipperVerificationStatus', authenticateToken, adminController.changeShipperVerificationStatus.bind(adminController));
admin_route.get('/fetchRequestTrucks', authenticateToken, adminController.getRequestedTrucks.bind(adminController));
admin_route.patch('/changeTruckVerificationStatus', authenticateToken, adminController.changeTruckVerificationStatus.bind(adminController));
admin_route.get('/fetchLoads', authenticateToken, adminController.getLoads.bind(adminController));


export default admin_route