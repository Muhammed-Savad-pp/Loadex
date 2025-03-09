import { CustomeRequest } from "../../Middleware/userAuth";
import { Response } from "express";

export interface ITransporterController {
    verificationStatus(req: CustomeRequest, res: Response): Promise<void>;
    getProfileData (req: CustomeRequest, res: Response): Promise<void>;
    kycVerification (req: CustomeRequest, res: Response): Promise<void>;
    registerTruck (req: CustomeRequest, res: Response): Promise<void>;
    
}