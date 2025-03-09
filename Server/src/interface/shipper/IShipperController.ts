import { Request, Response } from "express";
import { CustomeRequest } from "../../Middleware/userAuth";


export interface IShipperController {
    SignUp (req: Request, res: Response): Promise<void>;
    verifyOtp (req: Request, res: Response): Promise<void>;
    resendOtp (req: Request, res: Response): Promise<void>;
    signIn(req: Request, res: Response): Promise<void>;
    Logout(req: Request, res: Response): Promise<void>;
    getProfileData(req: CustomeRequest, res: Response): Promise<void>;
    registerKyc(req: CustomeRequest, res: Response): Promise<void>;
}