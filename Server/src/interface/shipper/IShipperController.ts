import { Request, Response } from "express";
import { CustomeRequest } from "../../Middleware/userAuth";


export interface IShipperController {
    SignUp (req: Request, res: Response): Promise<void>;
    verifyOtp (req: Request, res: Response): Promise<void>;
    resendOtp (req: Request, res: Response): Promise<void>;
    signIn(req: Request, res: Response): Promise<void>;
    GoogleLogin(req: Request, res: Response): Promise<void>;
    forgotPassword(req: Request, res: Response) : Promise<void>;
    Logout(req: Request, res: Response): Promise<void>;
    getProfileData(req: CustomeRequest, res: Response): Promise<void>;
    registerKyc(req: CustomeRequest, res: Response): Promise<void>;
    postLoad(req: CustomeRequest, res: Response): Promise<void>;
    getVerificationstatus(req: CustomeRequest, res: Response) : Promise<void>;
    changePassword(req: Request, res: Response) : Promise<void>;
    fetchBids(req: CustomeRequest, res: Response): Promise<void>;
    updateBidStatus(req: CustomeRequest, res: Response): Promise<void>;
    fetchLoads(req: CustomeRequest, res: Response): Promise<void>;
    checkoutSession(req: CustomeRequest, res: Response): Promise<void>;
    verifyPayment(req: CustomeRequest, res: Response): Promise<void>;
    fetchTrips(req: CustomeRequest, res: Response): Promise<void>;
    updateProfile(req: CustomeRequest, res: Response): Promise<void>;
    fetchTransporterDetails(req: CustomeRequest, res: Response): Promise<void>;
    followTransporter(req: CustomeRequest, res: Response): Promise<void>;
    unFollowTransporter(req: CustomeRequest, res: Response): Promise<void>;
    postReview(req: CustomeRequest, res: Response): Promise<void>;
    fetchTransportes(req: CustomeRequest, res: Response): Promise<void>;
    fetchTrucks(req: CustomeRequest, res: Response): Promise<void>;
    getShipperSubscriptionPlan(req: CustomeRequest, res: Response): Promise<void>;
    subscriptionCheckoutSession(req: CustomeRequest, res: Response): Promise<void>;
    handleSubscriptionSuccess(req: CustomeRequest , res: Response): Promise<void>;
    updateLoad(req: CustomeRequest, res: Response): Promise<void>;
    deleteLoad(req: CustomeRequest, res: Response): Promise<void>;
    createChat(req: CustomeRequest, res: Response): Promise<void>;
    fetchChats(req: CustomeRequest, res: Response): Promise<void>;
    fetchMessages(req: CustomeRequest, res: Response): Promise<void>;
    sendMessage(req: CustomeRequest, res: Response): Promise<void>;
    getCurrentShipperId(req: CustomeRequest, res: Response): Promise<void>;
    upateMessageAsRead(req: CustomeRequest, res: Response): Promise<void>;
    fetchNotifications(req: CustomeRequest, res: Response): Promise<void>;
    updateNotificationAsRead(req: CustomeRequest, res: Response): Promise<void>;
    deleteNotification(req: CustomeRequest, res: Response): Promise<void>;
    fetchpaymentHistory(req: CustomeRequest, res: Response): Promise<void>;
    findUnReadNotificationCount(req: CustomeRequest, res: Response): Promise<void>;

}