import { IBid } from "../../models/BidModel";
import { ILoad } from "../../models/LoadModel";
import { ITransporter } from "../../models/TransporterModel";
import { ITruck } from "../../models/TruckModel";
import { ITrip } from "../../models/TripModel";
import { IShipper } from "../../models/ShipperModel";
import { IRatingReview } from "../../models/ReviewRatingModel";

export interface ITransporterService {
    verificationStatus (id: string) : Promise<{success: boolean, message: string, verificationStatus?: string}>;
    getProfileData (id: string) : Promise<{success: boolean, message: string, transporterData?: Partial<ITransporter>}>;
    kycVerification (transporterId : string, panNumber: string, aadhaarFront?: Express.Multer.File , aadhaarBack?: Express.Multer.File) : Promise<{success: boolean, message: string, transporterData?: Partial<ITransporter>}>;
    registerTruck (transporterId: string, truckData:{ vehicleNumber: string,  ownerName: string,ownerMobileNo: string,
        type: string, capacity: string, tyres: string, driverName: string, driverMobileNumber: string, currentLocation: string,
        from: string, to: string,selectedLocations:string[],currentLocationCoords: { lat:number, lng:number},
        fromCoords: { lat: number, lng: number },
        toCoords: { lat: number, lng: number }
        }, rcBook: Express.Multer.File, driverLicense: Express.Multer.File) : Promise<{success: boolean, message: string}>;
    
    getLoads(): Promise<ILoad[] | null>;
    findTrucks(id: string) : Promise<ITruck[] | null>;
    updateTruckAvailable(formData: Partial<ITruck>, driverLicensefile?: Express.Multer.File) : Promise <{success: boolean, truckData?: ITruck, message: string}>;
    sendBid(formData: {truckNo: string, rent: string, loadId: string, shipperId: string}, transporterId: string): Promise<{success: boolean, message: string}>;
    fetchAllBids(transporterid: string): Promise<IBid[] | null>;
    bidCheckoutSession(bidID: string): Promise<{success: boolean, message: string, sessionId?: string}>;
    verifyBidPayment(transactionId: string, status: string): Promise<{success: boolean, message: string}>;
    fetchTrips(transporterId: string): Promise<ITrip[] | null>;
    updateTripStatus(tripId: string, newStatus: 'confirmed' | 'inProgress' | 'arrived' | 'completed'): Promise<{success: boolean, message: string}>;
    updateProfile(transporterId: string, transporterName: string, phone: string, profileImage: Express.Multer.File): Promise<{success: boolean, message: string, transporterData?: Partial<ITransporter>}>;
    fetchShipperProfileData(transporterId: string, shipperId: string): Promise<{shipperData: IShipper, isFollow: boolean, loadsCount: number, tripsCount: number, reviews: Partial<IRatingReview>[]; averageRating: number,  isReview: boolean}>
    followShipper(transporterId: string, shipperId: string): Promise<{success: boolean, shipperData: IShipper ,  isFollow: boolean}>;
    unFollowShipper(transporterId: string, shipperId: string): Promise<{success: boolean, shipperData: IShipper, isFollow: boolean}>;
    postReviews(transporterId: string, shipperId: string, rating: number, comment: string): Promise<{success: boolean, reviewData?: IRatingReview}>
    fetchShippers(): Promise<IShipper[] | null>

}