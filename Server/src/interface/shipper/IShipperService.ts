import { IBid } from "../../models/BidModel";
import { ILoad } from "../../models/LoadModel";
import { IRatingReview } from "../../models/ReviewRatingModel";
import { IShipper } from "../../models/ShipperModel";
import { ITransporter } from "../../models/TransporterModel";
import { ITrip } from "../../models/TripModel";
import { ITruck } from "../../models/TruckModel";

export interface IShipperService {
    shipperSignUp(shipperName: string, email: string, phone: string, password: string, confirmPassword: string): Promise<{success: boolean, message: string}>
    verifyShipperOtp (otpdata: {otpData: string, email: string}) : Promise<{success: boolean, message: string}>;
    resendOtp(resendOtpData: {email: string}) : Promise<{success: boolean, message: string}>;
    shipperLogin(userData: {email: string, password: string}) : Promise<{success: boolean, message: string, data?: Partial<IShipper>, accessToken?: string, refreshToken?: string}> ;
    getShipperProfileData(id: string):Promise<{success: boolean, message: string, shipperData?: Partial<IShipper>}> 
    registerKyc(shipperId: string, companyName: string, panNumber: string, gstNumber: string, aadhaarFront?: Express.Multer.File, aadhaarBack?: Express.Multer.File) : Promise<{success: boolean, message: string, shipperData?: Partial<IShipper>}>;
    createLoad(shipperId: string, formData: Partial<ILoad>) : Promise<{success: boolean, message: string}>;
    getVerificationStatus(id: string): Promise<{success: boolean, message: string, shipperData?:string}>;
    forgotPassword (email: string): Promise<{success: boolean, message: string}>;
    setNewPassword(email: string, password: string): Promise<{success: boolean, message: string}>
    findBids(id: string): Promise<IBid[] | null>;
    updateBidStatus(bidId: string, status: string): Promise<{success: boolean , message: string, bidData?:IBid}>;
    getShipperLoads(shipperId: string):Promise<ILoad[] | null>;
    shipperGoogleLoging(name: string, email: string):  Promise<{success: boolean, message: string, data?: Partial<IShipper> | null, accessToken?: string, refreshToken?: string}> ;
    sessionCheckout(bidId: string): Promise<{success: boolean, message: string, sessionId?: string}>
    verifyPayment(transactionId: string, status: string): Promise<{success: boolean, message: string}>;
    fetchTrips(shipperId: string): Promise<ITrip[] | null>;
    updateProfile(shipperId: string, shipperName: string, phone: string, profileImage?: Express.Multer.File): Promise<{success: boolean, message: string, shipperData?: Partial<IShipper>}>
    fetchTransporterDetails(shipperId: string, transporterId: string): Promise<{transporterData: ITransporter, isFollow: boolean, truckCount: number, tripsCount: number ,reviews: Partial<IRatingReview>[], averageRating: number, isReview: boolean}>;
    followTransporter(shipperId: string, tranpsorterId: string): Promise<{success: boolean, transporterData: ITransporter, isFollow: boolean}>
    unFollowTransporter(shipperId: string, transporterId: string): Promise<{success: boolean, transporterData: ITransporter, isFollow: boolean}>;
    postReview(shipperId: string, tranpsorterId: string, rating: number, comment: string): Promise<{success: boolean, reviewData?: IRatingReview}>
    fetchTransporters(): Promise<ITransporter[] | null>
    fetchTrucks(): Promise<ITruck[] | null>
    
}