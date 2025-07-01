import { Request , Response } from "express"

export interface ITransporterAuthController {

    signUp(req:Request, res:Response): Promise<void>;
    verifyOtp(req: Request, res: Response): Promise<void>;
    signIn(req: Request, res: Response): Promise<void>;
    resendOtp(req: Request, res: Response): Promise<void>;
    validateRefreshToken (req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    forgotPassword (req: Request, res: Response): Promise<void>;
    changeNewPassword(req: Request, res: Response): Promise<void>;
    googleLogin(req: Request, res: Response) : Promise<void>;

}