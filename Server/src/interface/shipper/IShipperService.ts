import { ChatForShipperDTO } from "../../dtos/chat/chat.dto";
import { NotificationForShipper } from "../../dtos/notifications/notification.dto";
import { ReviewForShipperDTO } from "../../dtos/reviews/review.dto";
import { ShipperDTO, ShipperPaymentDTO, TransporterForShipperDTO } from "../../dtos/shipper/shipper.dto";
import { TripForShipperDTO } from "../../dtos/trip/trip.for.transporter.dto";
import { IChat } from "../../models/Chat";
import { IMessage } from "../../models/Message";
import { IRatingReview } from "../../models/ReviewRatingModel";

export interface IShipperService {
    shipperSignUp(shipperName: string, email: string, phone: string, password: string, confirmPassword: string): Promise<{success: boolean, message: string}>
    verifyShipperOtp (otpdata: {otpData: string, email: string}) : Promise<{success: boolean, message: string}>;
    resendOtp(resendOtpData: {email: string}) : Promise<{success: boolean, message: string}>;
    shipperLogin(userData: {email: string, password: string}) : Promise<{success: boolean, message: string, accessToken?: string, refreshToken?: string}> ;
    getShipperProfileData(id: string):Promise<{success: boolean, message: string, shipperData?: ShipperDTO}> 
    registerKyc(shipperId: string, companyName: string, panNumber: string, gstNumber: string, aadhaarFront?: Express.Multer.File, aadhaarBack?: Express.Multer.File) : Promise<{success: boolean, message: string, shipperData?: ShipperDTO}>;
    getVerificationStatus(id: string): Promise<{success: boolean, message: string, shipperData?:string}>;
    forgotPassword (email: string): Promise<{success: boolean, message: string}>;
    setNewPassword(email: string, password: string): Promise<{success: boolean, message: string}>
    shipperGoogleLoging(name: string, email: string):  Promise<{success: boolean, message: string,  accessToken?: string, refreshToken?: string}> ;
    sessionCheckout(bidId: string): Promise<{success: boolean, message: string, sessionId?: string}>
    verifyPayment(transactionId: string, status: string): Promise<{success: boolean, message: string}>;
    updateProfile(shipperId: string, shipperName: string, phone: string, profileImage?: Express.Multer.File): Promise<{success: boolean, message: string, shipperData?: ShipperDTO}>
    fetchTransporterDetails(shipperId: string, transporterId: string): Promise<{transporterData: TransporterForShipperDTO, isFollow: boolean, truckCount: number, tripsCount: number ,reviews: ReviewForShipperDTO[], averageRating: number, isReview: boolean}>;
    followTransporter(shipperId: string, tranpsorterId: string): Promise<{success: boolean, transporterData: TransporterForShipperDTO, isFollow: boolean}>
    unFollowTransporter(shipperId: string, transporterId: string): Promise<{success: boolean, transporterData: TransporterForShipperDTO, isFollow: boolean}>;
    postReview(shipperId: string, tranpsorterId: string, rating: number, comment: string): Promise<{success: boolean, reviewData?: IRatingReview}>
    fetchTransporters(page: number, limit: number, search: string): Promise<{transporters: TransporterForShipperDTO[] | null, totalPages: number}>
    fetchShipperPlans(): Promise<{shipperPlans: {}}>
    subscriptionCheckoutSession(shipperId: string, planId: string): Promise<{success: boolean, sessionId?: string, message: string}>
    handleSubscriptionSuccess(shipperId: string, sessionId: string, planId: string): Promise<{success: boolean, message: string; planName: string; endDate: Date}>
    checkExpiredSubscriptions(): Promise<void>;
    startChat(shipperId: string, transporterId: string): Promise<{success: boolean, chatData: IChat}>
    fetchChats(shipperId: string): Promise<ChatForShipperDTO[] | null>;
    fetchMessages(chatId: string): Promise<IMessage[]>;
    sendMessage(shipperId: string, chatId: string, transporterId: string, content: string): Promise<{success: boolean, messageData?: IMessage}>;
    upateMessageAsRead(chatId: string, shipperId: string): Promise<{success: boolean}>;
    fetchNotifications(shipperId: string, status: string): Promise<NotificationForShipper[]>;
    updateNotificationAsRead(notificationId: string): Promise<{success: boolean, message: string, notificationData?:NotificationForShipper}>;
    deleteNotification(notificationId: string): Promise<{success: boolean, message: string, notificationData?: NotificationForShipper}>;
    fetchPaymentHistory(shipperId: string, status: string, type: string, date: string, page: number, limit: number, search: string): Promise<{paymentData:ShipperPaymentDTO[], totalPages: number, totalEarnings: number, bidPayments: number, subscriptionPayment: number, pendingAmount: number}>;
    checkAndRefundExpiredBids(): Promise<{success: boolean}>
    expireInActiveLoads(): Promise<void>
    findUnReadNotificationCount(shipperId: string): Promise<number | undefined>
}