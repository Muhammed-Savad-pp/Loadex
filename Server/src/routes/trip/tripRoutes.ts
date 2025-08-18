import express from "express"
import { TripService } from "../../services/trip/tripService";
import { TripController } from "../../controller/tripController/tripController";
import tripRepository from "../../repositories/implementaion/tripRepository";
import authenticateToken from "../../Middleware/userAuth";
import { checkRole } from "../../Middleware/checkRole";
import notificationRepository from "../../repositories/implementaion/notificationRepository";
import truckRepository from "../../repositories/implementaion/truckRepository";
import loadRepository from "../../repositories/implementaion/loadRepository";
import transporterWalletRepository from "../../repositories/implementaion/transporterWalletRepository";
import TransporterPaymentRepository from "../../repositories/implementaion/TransporterPaymentRepository";
import adminPaymentRepository from "../../repositories/implementaion/adminPaymentRepository";

const trip_route = express.Router();

const tripService = new TripService(
    tripRepository,
    notificationRepository,
    truckRepository,
    loadRepository,
    transporterWalletRepository,
    TransporterPaymentRepository,
    adminPaymentRepository
);

const tripController = new TripController(tripService);

trip_route.get('/trip-transporter', authenticateToken, checkRole('transporter'), tripController.fetchTripsForTransporter.bind(tripController));
trip_route.patch('/trip-status', authenticateToken, checkRole('transporter'), tripController.updateTripStatus.bind(tripController));
trip_route.get('/trip-shipper', authenticateToken, checkRole('shipper'), tripController.fetchTripsForShipper.bind(tripController));
trip_route.get('/trip-admin', authenticateToken, checkRole('admin'), tripController.fetchTripsForAdmin.bind(tripController))
trip_route.post('/pay-trip-amount', authenticateToken, checkRole('admin'), tripController.sendTripAmountToTransporter.bind(tripController));


export default trip_route;