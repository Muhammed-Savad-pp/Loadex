import { IBid } from "../../models/BidModel";
import { ILoad } from "../../models/LoadModel";
import { ITransporter } from "../../models/TransporterModel";
import { ITruck } from "../../models/TruckModel";
import { ITrip } from "../../models/TripModel";
import { IShipper } from "../../models/ShipperModel";
import { IRatingReview } from "../../models/ReviewRatingModel";
import { UpdateResult } from "mongoose";
import { ITransporterPayment } from "../../models/TransporterPayment";
import { IChat } from "../../models/Chat";
import { IMessage } from "../../models/Message";
import { INotification } from "../../models/NotificationModel";
import { ITransporterWallet } from "../../models/TransporterWallet";
import { BidForTransporterDTO } from "../../dtos/bids/bid.for.transporter.dto";
import { TransporterDTO } from "../../dtos/transporter/transporter.dto";
import { TruckDTO } from "../../dtos/truck/truck.for.transporter.dto";
import { TripForTransporterDTO } from "../../dtos/trip/trip.for.transporter.dto";

export interface ITransporterService {
    verificationStatus (id: string) : Promise<{success: boolean, message: string, verificationStatus?: string}>;
    getProfileData (id: string) : Promise<{success: boolean, message: string, transporterData?: Partial<TransporterDTO>}>;
    kycVerification (transporterId : string, panNumber: string, aadhaarFront?: Express.Multer.File , aadhaarBack?: Express.Multer.File) : Promise<{success: boolean, message: string, transporterData?: Partial<ITransporter>}>;
    registerTruck (transporterId: string, truckData:{ vehicleNumber: string,  ownerName: string,ownerMobileNo: string,
        type: string, capacity: string, tyres: string, driverName: string, driverMobileNumber: string, currentLocation: string,
        from: string, to: string,selectedLocations:string[],currentLocationCoords: { lat:number, lng:number},
        fromCoords: { lat: number, lng: number },
        toCoords: { lat: number, lng: number }
        }, rcBook: Express.Multer.File, driverLicense: Express.Multer.File, truckImage: Express.Multer.File) : Promise<{success: boolean, message: string}>;
    
    getLoads(page: number, limit: number): Promise<{loads: ILoad[] | null, currentPage: number, totalPages: number, totalItems: number}>
    findTrucks(id: string, status: string, page: number, limit: number): Promise<{trucks:TruckDTO[] | null; totalPages: number}>
    updateTruckAvailable(formData: Partial<ITruck>, driverLicensefile?: Express.Multer.File) : Promise <{success: boolean, truckData?: ITruck, message: string}>;
    sendBid(formData: {truckNo: string, rent: string, loadId: string, shipperId: string}, transporterId: string): Promise<{success: boolean, message: string}>;
    fetchAllBids(transporterid: string, page: number, limit: number, status: string): Promise<{ bidDatas: BidForTransporterDTO[] | null, totalPages: number}>
    bidCheckoutSession(bidID: string): Promise<{success: boolean, message: string, sessionId?: string}>;
    verifyBidPayment(transactionId: string, status: string): Promise<{success: boolean, message: string}>;
    fetchTrips(transporterId: string, status: string, page: number, limit: number): Promise<{trips: TripForTransporterDTO[] | null, totalPages: number}>;
    updateTripStatus(tripId: string, newStatus: 'confirmed' | 'inProgress' | 'arrived' | 'completed'): Promise<{success: boolean, message: string}>;
    updateProfile(transporterId: string, transporterName: string, phone: string, profileImage: Express.Multer.File): Promise<{success: boolean, message: string, transporterData?: Partial<ITransporter>}>;
    fetchShipperProfileData(transporterId: string, shipperId: string): Promise<{shipperData: IShipper, isFollow: boolean, loadsCount: number, tripsCount: number, reviews: Partial<IRatingReview>[]; averageRating: number,  isReview: boolean}>
    followShipper(transporterId: string, shipperId: string): Promise<{success: boolean, shipperData: IShipper ,  isFollow: boolean}>;
    unFollowShipper(transporterId: string, shipperId: string): Promise<{success: boolean, shipperData: IShipper, isFollow: boolean}>;
    postReviews(transporterId: string, shipperId: string, rating: number, comment: string): Promise<{success: boolean, reviewData?: IRatingReview}>
    fetchShippers(page: number, limit: number): Promise<{shipper: IShipper[] | null, totalPages: number, totalItems: number}>
    fetchTransporterFollowersandFollowings(transporterId: string, status: string, search: string, page: number, limit: number): Promise<{ datas: any[], followersCount: number, followingsCount: number, totalPages: number}>;
    fetchSubscriptionPlans(): Promise<{subscriptionPlans: {}}>
    subscriptionCheckoutSession(transporterId: string, planId: string): Promise<{success: boolean, sessionId?: string, message: string}>
    subscriptionSuccess(transporterId: string, sessionId: string, planId: string): Promise<{success: boolean, message: string, planName?: string, endDate?: Date}>
    checkExpiredSubscription(): Promise<void>;
    fetchActiveTrucks(transporterId: string): Promise<ITruck[] | null>
    updateBid(bidId: string, truckId: string, price: string): Promise<{success: boolean, message: string, updateBid?: IBid}>
    deleteBidById(bidId: string): Promise<{success: boolean, message: string, BidData?: IBid}>;
    fetchPaymentHistory(transporterId: string, status: string, type: string, date: string, page: number, limit: number): Promise<{paymentData:ITransporterPayment[], totalPages: number, totalEarnings: number, bidPayments: number, subscriptionPayment: number, pendingAmount: number}>;
    startChat(transporterId: string, shipperId: string): Promise<{success: boolean, chatData: IChat}>;
    fetchChats(transporterId: string): Promise< IChat[]>;
    sendMessage(transporterId: string , chatId: string , shipperId: string, content: string): Promise<{success: boolean, messageData?: IMessage}>;
    fetchMessages(chatId: string): Promise<IMessage[]>;
    updateMessageAsRead(chatId: string, transporeterId: string): Promise<{success: boolean}>;
    fetchNotifications(transporterId: string, status: string): Promise<INotification[]>;
    updateNotificationAsRead(notificationId: string): Promise<{success: boolean, message: string, notificationData?:INotification}>;
    deleteNotification(notificationId: string): Promise<{success: boolean, message: string, notificationData?: INotification}>;
    fetchWalletData(tranpsorterId: string): Promise<ITransporterWallet | null>;
    bidPaymentByWallet(transporterId: string, bidId: string): Promise<{success: boolean, message: string}>;
    findUnreadNotificationCount(transporeterId: string): Promise<number>;
    updateTruck(updateData: Partial<ITruck>, truckImage?: Express.Multer.File): Promise<{success: boolean, message: string}>
}