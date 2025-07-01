import { CustomeRequest } from "../../Middleware/userAuth";
import { Response } from "express";

export interface ITransporterController {
    verificationStatus(req: CustomeRequest, res: Response): Promise<void>;
    getProfileData (req: CustomeRequest, res: Response): Promise<void>;
    kycVerification (req: CustomeRequest, res: Response): Promise<void>;
    registerTruck (req: CustomeRequest, res: Response): Promise<void>;
    fetchLoads(req: CustomeRequest, res: Response): Promise<void>;
    findTrucks(req: CustomeRequest, res: Response): Promise<void>;
    updateTruckAvailable(req: CustomeRequest, res: Response): Promise<void>;
    sendBid(req: CustomeRequest, res: Response): Promise<void>;
    fetchBids(req: CustomeRequest, res: Response): Promise<void>;
    bidCheckoutSession(req: CustomeRequest, res: Response): Promise<void>;
    verifyBidPayment(req: CustomeRequest, res: Response): Promise<void>;
    fetchTrips(req: CustomeRequest, res: Response): Promise<void>;
    updateTripStatus(req: CustomeRequest, res: Response): Promise<void>;
    updateProfile(req: CustomeRequest, res: Response): Promise<void>;
    fetchShipperProfileData(req: CustomeRequest, res: Response): Promise<void>;
    followShipper(req: CustomeRequest, res: Response): Promise<void>;
    unfollowShipper(req: CustomeRequest, res: Response): Promise<void>;
    postReview(req: CustomeRequest, res: Response): Promise<void>;
    fetchShippers(req: CustomeRequest, res: Response): Promise<void>;
    fetchFollowersAndFollowings(req: CustomeRequest, res: Response): Promise<void>;
    fetchSubscriptionPlans(req: CustomeRequest, res: Response): Promise<void>;
    subscriptionCheckoutSession(req: CustomeRequest, res: Response): Promise<void>;
    subscriptionSuccess(req: CustomeRequest, res: Response): Promise<void>;
    fetchActiveTruck(req: CustomeRequest, res: Response): Promise<void>;
    updateBid(req: CustomeRequest, res: Response): Promise<void>;
    deleteBidById(req: CustomeRequest, res: Response): Promise<void>;
    fetchPaymentHistory(req: CustomeRequest, res: Response): Promise<void>;
    createChat(req: CustomeRequest, res: Response): Promise<void>;
    fetchChat(req: CustomeRequest, res: Response): Promise<void>;
    sendMessage(req: CustomeRequest, res: Response): Promise<void>;
    fetchMessages(req: CustomeRequest, res: Response): Promise<void>;
    fetchCurrentTransporterId(req: CustomeRequest, res: Response): Promise<void>;
    updateMessageAsRead(req: CustomeRequest, res: Response): Promise<void>;
    fetchNotifications(req: CustomeRequest, res: Response): Promise<void>;
    updateNotificationAsRead(req: CustomeRequest, res: Response): Promise<void>;
    deleteNotification(req: CustomeRequest, res: Response): Promise<void>;
    fetchWalletData(req: CustomeRequest, res: Response): Promise<void>;
    bidPaymentByWallet(req: CustomeRequest, res: Response): Promise<void>;
    findUnreadNotificationCount(req: CustomeRequest, res: Response): Promise<void>;
    updateTruck(req: CustomeRequest, res: Response): Promise<void>
}