import express from "express"
import { AdminController } from "../../controller/adminController/adminController";
import { AdminService } from "../../services/admin/adminService";
import transporterRepositories from "../../repositories/implementaion/transporterRepository";
import shipperRepositories from "../../repositories/implementaion/shipperRepositories";
import loadRepository from "../../repositories/implementaion/loadRepository";
import truckRepository from "../../repositories/implementaion/truckRepository";
import notificationRepository from "../../repositories/implementaion/notificationRepository";
import tripRepository from "../../repositories/implementaion/tripRepository";
import transporterWalletRepository from "../../repositories/implementaion/transporterWalletRepository";
import TransporterPaymentRepository from "../../repositories/implementaion/TransporterPaymentRepository";
import adminPaymentRepository from "../../repositories/implementaion/adminPaymentRepository";

const admin_auth_route = express.Router();

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


admin_auth_route.post('/refresh-token', adminController.validateRefreshToken.bind(adminController));


export default admin_auth_route