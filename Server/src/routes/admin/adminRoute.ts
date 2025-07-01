import  express  from "express";
import { AdminController } from "../../controller/adminController/adminController";
import { AdminService } from "../../services/admin/adminService";
import authenticateToken from "../../Middleware/userAuth";
import transporterRepositories from "../../repositories/implementaion/transporterRepository";
import shipperRepositories from "../../repositories/implementaion/shipperRepositories";
import loadRepository from "../../repositories/implementaion/loadRepository";
import truckRepository from "../../repositories/implementaion/truckRepository";
import { checkRole } from "../../Middleware/checkRole";
import notificationRepository from "../../repositories/implementaion/notificationRepository";
import tripRepository from "../../repositories/implementaion/tripRepository";
import transporterWalletRepository from "../../repositories/implementaion/transporterWalletRepository";
import TransporterPaymentRepository from "../../repositories/implementaion/TransporterPaymentRepository";
import adminPaymentRepository from "../../repositories/implementaion/adminPaymentRepository";


const admin_route = express.Router()

const adminService = new AdminService(
    transporterRepositories, 
    shipperRepositories, 
    loadRepository, 
    truckRepository, 
    notificationRepository, 
    tripRepository, 
    transporterWalletRepository,
    TransporterPaymentRepository,
    adminPaymentRepository
)
const adminController = new AdminController(adminService)


admin_route.post('/login', adminController.login.bind(adminController));
admin_route.get('/transporters',authenticateToken, checkRole('admin'), adminController.getTransporter.bind(adminController));
admin_route.post('/logout', adminController.logout.bind(adminController));
admin_route.patch('/transporterBlockandUnblock', authenticateToken, checkRole('admin'),  adminController.updateTransporterBlockandUnblock.bind(adminController));
admin_route.get('/fetchRequestTransporter', authenticateToken, checkRole('admin'), adminController.getRequestedTransporters.bind(adminController));
admin_route.patch('/changeVerificationStatus', authenticateToken, checkRole('admin'), adminController.changeVerificationStatus.bind(adminController));
admin_route.get('/fetchShipper', authenticateToken, checkRole('admin'), adminController.getShipper.bind(adminController));
admin_route.patch('/changeShipperStatus', authenticateToken, checkRole('admin'), adminController.changeShipperStatus.bind(adminController));
admin_route.get('/fetchRequestShipper', authenticateToken, checkRole('admin'), adminController.getRequestedShipper.bind(adminController));
admin_route.patch('/changeShipperVerificationStatus', authenticateToken, checkRole('admin'), adminController.changeShipperVerificationStatus.bind(adminController));
admin_route.get('/fetchRequestTrucks', authenticateToken, checkRole('admin'),  adminController.getRequestedTrucks.bind(adminController));
admin_route.patch('/changeTruckVerificationStatus', authenticateToken, checkRole('admin'),  adminController.changeTruckVerificationStatus.bind(adminController));
admin_route.get('/fetchLoads', authenticateToken, checkRole('admin'), adminController.getLoads.bind(adminController));
admin_route.get('/fetchDashboardDatas', authenticateToken, checkRole('admin'), adminController.fetchDashboardDatas.bind(adminController));
admin_route.get('/trips', authenticateToken, checkRole('admin'), adminController.fetchTrips.bind(adminController))
admin_route.post('/sendTripAmountToTransporter', authenticateToken, checkRole('admin'), adminController.sendTripAmountToTransporter.bind(adminController));
admin_route.get('/paymentHistory', authenticateToken, checkRole('admin'), adminController.fetchPaymentHistory.bind(adminController))


export default admin_route