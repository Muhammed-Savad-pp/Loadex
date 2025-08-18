import { IChat } from "../../models/Chat";
import { IMessage } from "../../models/Message";
import { ShipperForTransporterDirectoryDTO, ShipperForTransporterDTO, TransporterDTO, TransporterPaymentDTO } from "../../dtos/transporter/transporter.dto";
import { TripForTransporterDTO } from "../../dtos/trip/trip.for.transporter.dto";
import { ReviewForTransporter } from "../../dtos/reviews/review.dto";
import { NotificationForTransporterDTO } from "../../dtos/notifications/notification.dto";
import { WalletForTransporterDTO } from "../../dtos/wallet/wallet.dto";
import { ChatForTransporterDTO } from "../../dtos/chat/chat.dto";

export interface ITransporterService {
    verificationStatus (id: string) : Promise<{success: boolean, message: string, verificationStatus?: string}>;
    getProfileData (id: string) : Promise<{success: boolean, message: string, transporterData?: TransporterDTO}>;
    kycVerification (transporterId : string, panNumber: string, aadhaarFront?: Express.Multer.File , aadhaarBack?: Express.Multer.File) : Promise<{success: boolean, message: string, transporterData?: Partial<TransporterDTO>}>;
    bidCheckoutSession(bidID: string): Promise<{success: boolean, message: string, sessionId?: string}>;
    verifyBidPayment(transactionId: string, status: string): Promise<{success: boolean, message: string}>;
    updateProfile(transporterId: string, transporterName: string, phone: string, profileImage: Express.Multer.File): Promise<{success: boolean, message: string, transporterData?: TransporterDTO}>;
    fetchShipperProfileData(transporterId: string, shipperId: string): Promise<{shipperData: ShipperForTransporterDTO, isFollow: boolean, loadsCount: number, tripsCount: number, reviews:ReviewForTransporter[]; averageRating: number,  isReview: boolean}>
    followShipper(transporterId: string, shipperId: string): Promise<{success: boolean, shipperData: ShipperForTransporterDTO ,  isFollow: boolean}>;
    unFollowShipper(transporterId: string, shipperId: string): Promise<{success: boolean, shipperData: ShipperForTransporterDTO, isFollow: boolean}>;
    postReviews(transporterId: string, shipperId: string, rating: number, comment: string): Promise<{success: boolean, reviewData?: ReviewForTransporter}>
    fetchShippers(page: number, limit: number, search: string): Promise<{shipper: ShipperForTransporterDirectoryDTO[] | null, totalPages: number, totalItems: number}>
    fetchTransporterFollowersandFollowings(transporterId: string, status: string, search: string, page: number, limit: number): Promise<{ datas: any[], followersCount: number, followingsCount: number, totalPages: number}>;
    fetchSubscriptionPlans(): Promise<{subscriptionPlans: {}}>
    subscriptionCheckoutSession(transporterId: string, planId: string): Promise<{success: boolean, sessionId?: string, message: string}>
    subscriptionSuccess(transporterId: string, sessionId: string, planId: string): Promise<{success: boolean, message: string, planName?: string, endDate?: Date}>
    checkExpiredSubscription(): Promise<void>;
    fetchPaymentHistory(transporterId: string, status: string, type: string, date: string, page: number, limit: number): Promise<{paymentData:TransporterPaymentDTO[], totalPages: number, totalEarnings: number, bidPayments: number, subscriptionPayment: number, pendingAmount: number}>;
    startChat(transporterId: string, shipperId: string): Promise<{success: boolean, chatData: IChat}>;
    fetchChats(transporterId: string): Promise< ChatForTransporterDTO[]>;
    sendMessage(transporterId: string , chatId: string , shipperId: string, content: string): Promise<{success: boolean, messageData?: IMessage}>;
    fetchMessages(chatId: string): Promise<IMessage[]>;
    updateMessageAsRead(chatId: string, transporeterId: string): Promise<{success: boolean}>;
    fetchNotifications(transporterId: string, status: string): Promise<NotificationForTransporterDTO[]>;
    updateNotificationAsRead(notificationId: string): Promise<{success: boolean, message: string, notificationData?:NotificationForTransporterDTO}>;
    deleteNotification(notificationId: string): Promise<{success: boolean, message: string, notificationData?: NotificationForTransporterDTO}>;
    fetchWalletData(tranpsorterId: string): Promise<WalletForTransporterDTO | null>;
    bidPaymentByWallet(transporterId: string, bidId: string): Promise<{success: boolean, message: string}>;
    findUnreadNotificationCount(transporeterId: string): Promise<number>;
}