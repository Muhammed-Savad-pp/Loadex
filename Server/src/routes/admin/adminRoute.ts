import  express  from "express";
import { AdminController } from "../../controller/adminController/adminController";
import { AdminService } from "../../services/admin/adminService";
import authenticateToken from "../../Middleware/userAuth";
import transporterRepositories from "../../repositories/implementaion/transporterRepository";
import shipperRepositories from "../../repositories/implementaion/shipperRepositories";


const admin_route = express.Router()

const adminService = new AdminService(transporterRepositories, shipperRepositories)
const adminController = new AdminController(adminService)


admin_route.post('/login', adminController.login.bind(adminController));
admin_route.get('/getTransporter',authenticateToken, adminController.getTransporter.bind(adminController));
admin_route.post('/logout', adminController.logout.bind(adminController));
admin_route.patch('/transporterBlockandUnblock', authenticateToken,  adminController.updateTransporterBlockandUnblock.bind(adminController));
admin_route.get('/getrequestTransporter', authenticateToken, adminController.getRequestedTransporters.bind(adminController));
admin_route.patch('/changeVerificationStatus', authenticateToken,  adminController.changeVerificationStatus.bind(adminController));
admin_route.get('/getShipper', authenticateToken, adminController.getShipper.bind(adminController));
admin_route.patch('/changeShipperStatus', authenticateToken, adminController.changeShipperStatus.bind(adminController));
admin_route.get('/getRequestedShipper', authenticateToken, adminController.getRequestedShipper.bind(adminController));
admin_route.patch('/changeShipperVerificationStatus', authenticateToken, adminController.changeShipperVerificationStatus.bind(adminController))


export default admin_route