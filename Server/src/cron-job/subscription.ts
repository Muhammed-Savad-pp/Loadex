import cron from "node-cron";
import { ShipperService } from '../services/shipper/shipperService';
import shipperRepositories from "../repositories/implementaion/shipperRepositories";
import otpRepositories from "../repositories/implementaion/otpRepositories";
import loadRepository from "../repositories/implementaion/loadRepository";
import bidRepository from "../repositories/implementaion/bidRepository";
import shipperPaymentRepository from "../repositories/implementaion/shipperPaymentRepository";
import tripRepository from "../repositories/implementaion/tripRepository";
import transporterRepository from "../repositories/implementaion/transporterRepository";
import truckRepository from "../repositories/implementaion/truckRepository";
import reviewRatingRepository from "../repositories/implementaion/reviewRatingRepository";
import { TransporterService } from "../services/transporter/transporterService";
import TransporterPaymentRepository from "../repositories/implementaion/TransporterPaymentRepository";
import chatRepository from "../repositories/implementaion/chatRepository";
import messageRepository from "../repositories/implementaion/messageRepository";
import notificationRepository from "../repositories/implementaion/notificationRepository";
import transporterWalletRepository from "../repositories/implementaion/transporterWalletRepository";
import adminPaymentRepository from "../repositories/implementaion/adminPaymentRepository";

const shipperService = new ShipperService(
    shipperRepositories,
    otpRepositories,
    loadRepository,
    bidRepository,
    shipperPaymentRepository,
    tripRepository,
    transporterRepository,
    truckRepository,
    reviewRatingRepository,
    chatRepository,
    messageRepository,
    notificationRepository,
    adminPaymentRepository
)

const transporterService = new TransporterService(
    transporterRepository,
    truckRepository,
    bidRepository,
    loadRepository,
    TransporterPaymentRepository,
    tripRepository,
    shipperRepositories,
    reviewRatingRepository,
    chatRepository,
    messageRepository,
    notificationRepository,
    transporterWalletRepository,
    adminPaymentRepository
)


function runSubscriptionExpiryJob() {
    cron.schedule('0 0 * * * ', async () => {
        console.log('Running subscription expiry check...');
        await shipperService.checkExpiredSubscriptions()
        await transporterService.checkExpiredSubscription()
    })
}


export default runSubscriptionExpiryJob


