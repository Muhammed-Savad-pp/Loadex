import adminPaymentRepository from "../repositories/implementaion/adminPaymentRepository";
import bidRepository from "../repositories/implementaion/bidRepository";
import chatRepository from "../repositories/implementaion/chatRepository";
import loadRepository from "../repositories/implementaion/loadRepository";
import messageRepository from "../repositories/implementaion/messageRepository";
import notificationRepository from "../repositories/implementaion/notificationRepository";
import otpRepositories from "../repositories/implementaion/otpRepositories";
import reviewRatingRepository from "../repositories/implementaion/reviewRatingRepository";
import shipperPaymentRepository from "../repositories/implementaion/shipperPaymentRepository";
import shipperRepositories from "../repositories/implementaion/shipperRepositories";
import transporterRepository from "../repositories/implementaion/transporterRepository";
import tripRepository from "../repositories/implementaion/tripRepository";
import truckRepository from "../repositories/implementaion/truckRepository";
import { ShipperService } from "../services/shipper/shipperService";
import cron from "node-cron";


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


function runBidExpiredAndRefund() {
    cron.schedule('0 */5 * * *', async () => {

        console.log('Running bid expiration check...');
        await shipperService.checkAndRefundExpiredBids()
    });
}

export default runBidExpiredAndRefund