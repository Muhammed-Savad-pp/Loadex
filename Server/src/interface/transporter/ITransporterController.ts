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
}