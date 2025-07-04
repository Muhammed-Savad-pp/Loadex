import { BidForShipperDTO } from "../../dtos/bids/bid.for.shipper.dto";
import { ShipperDTO } from "../../dtos/shipper/shipper.dto";
import { IBid } from "../../models/BidModel";
import { IChat } from "../../models/Chat";
import { ILoad } from "../../models/LoadModel";
import { IMessage } from "../../models/Message";
import { INotification } from "../../models/NotificationModel";
import { IRatingReview } from "../../models/ReviewRatingModel";
import { IShipper } from "../../models/ShipperModel";
import { IShipperPayment } from "../../models/ShipperPaymentModel";
import { ITransporter } from "../../models/TransporterModel";
import { ITrip } from "../../models/TripModel";
import { ITruck } from "../../models/TruckModel";

export interface IShipperService {
    shipperSignUp(shipperName: string, email: string, phone: string, password: string, confirmPassword: string): Promise<{success: boolean, message: string}>
    verifyShipperOtp (otpdata: {otpData: string, email: string}) : Promise<{success: boolean, message: string}>;
    resendOtp(resendOtpData: {email: string}) : Promise<{success: boolean, message: string}>;
    shipperLogin(userData: {email: string, password: string}) : Promise<{success: boolean, message: string, data?: Partial<IShipper>, accessToken?: string, refreshToken?: string}> ;
    getShipperProfileData(id: string):Promise<{success: boolean, message: string, shipperData?: ShipperDTO}> 
    registerKyc(shipperId: string, companyName: string, panNumber: string, gstNumber: string, aadhaarFront?: Express.Multer.File, aadhaarBack?: Express.Multer.File) : Promise<{success: boolean, message: string, shipperData?: Partial<IShipper>}>;
    createLoad(shipperId: string, formData: Partial<ILoad>) : Promise<{success: boolean, message: string}>;
    getVerificationStatus(id: string): Promise<{success: boolean, message: string, shipperData?:string}>;
    forgotPassword (email: string): Promise<{success: boolean, message: string}>;
    setNewPassword(email: string, password: string): Promise<{success: boolean, message: string}>
    findBids(id: string, page: number, limit: number, status: string): Promise<{bidData: BidForShipperDTO[] | null, totalPages: number}>
    updateBidStatus(bidId: string, status: string): Promise<{success: boolean , message: string, bidData?:IBid}>;
    getShipperLoads(shipperId: string, page: number, limit: number): Promise<{loads: ILoad[] | null, totalPages: number}> 
    shipperGoogleLoging(name: string, email: string):  Promise<{success: boolean, message: string, data?: Partial<IShipper> | null, accessToken?: string, refreshToken?: string}> ;
    sessionCheckout(bidId: string): Promise<{success: boolean, message: string, sessionId?: string}>
    verifyPayment(transactionId: string, status: string): Promise<{success: boolean, message: string}>;
    fetchTrips(shipperId: string, page: number, limit: number): Promise<{tripsData: ITrip[] | null, totalPages: number}>
    updateProfile(shipperId: string, shipperName: string, phone: string, profileImage?: Express.Multer.File): Promise<{success: boolean, message: string, shipperData?: Partial<IShipper>}>
    fetchTransporterDetails(shipperId: string, transporterId: string): Promise<{transporterData: ITransporter, isFollow: boolean, truckCount: number, tripsCount: number ,reviews: Partial<IRatingReview>[], averageRating: number, isReview: boolean}>;
    followTransporter(shipperId: string, tranpsorterId: string): Promise<{success: boolean, transporterData: ITransporter, isFollow: boolean}>
    unFollowTransporter(shipperId: string, transporterId: string): Promise<{success: boolean, transporterData: ITransporter, isFollow: boolean}>;
    postReview(shipperId: string, tranpsorterId: string, rating: number, comment: string): Promise<{success: boolean, reviewData?: IRatingReview}>
    fetchTransporters(page: number, limit: number): Promise<{transporters: ITransporter[] | null, totalPages: number}>
    fetchTrucks(): Promise<ITruck[] | null>
    fetchShipperPlans(): Promise<{shipperPlans: {}}>
    subscriptionCheckoutSession(shipperId: string, planId: string): Promise<{success: boolean, sessionId?: string, message: string}>
    handleSubscriptionSuccess(shipperId: string, sessionId: string, planId: string): Promise<{success: boolean, message: string; planName: string; endDate: Date}>
    checkExpiredSubscriptions(): Promise<void>;
    updateLoad(formData: Partial<ILoad>): Promise<{success: boolean, message: string, updateData?: Partial<ILoad>}>
    deleteLoadByLoadId(loadId: string): Promise<{success: boolean, message: string, loadData?: Partial<ILoad> }>;
    startChat(shipperId: string, transporterId: string): Promise<{success: boolean, chatData: IChat}>
    fetchChats(shipperId: string): Promise<IChat[] | null>;
    fetchMessages(chatId: string): Promise<IMessage[]>;
    sendMessage(shipperId: string, chatId: string, transporterId: string, content: string): Promise<{success: boolean, messageData?: IMessage}>;
    upateMessageAsRead(chatId: string, shipperId: string): Promise<{success: boolean}>;
    fetchNotifications(shipperId: string, status: string): Promise<INotification[]>;
    updateNotificationAsRead(notificationId: string): Promise<{success: boolean, message: string, notificationData?:INotification}>;
    deleteNotification(notificationId: string): Promise<{success: boolean, message: string, notificationData?: INotification}>;
    fetchPaymentHistory(shipperId: string, status: string, type: string, date: string, page: number, limit: number): Promise<{paymentData:IShipperPayment[], totalPages: number, totalEarnings: number, bidPayments: number, subscriptionPayment: number, pendingAmount: number}>;
    checkAndRefundExpiredBids(): Promise<{success: boolean}>
    expireInActiveLoads(): Promise<void>
    findUnReadNotificationCount(shipperId: string): Promise<number | undefined>

}