import { IShipper } from "../../models/shipper/ShipperModel";

export interface IShipperService {
    shipperSignUp(shipperName: string, email: string, phone: string, password: string, confirmPassword: string): Promise<{success: boolean, message: string}>
    verifyShipperOtp (otpdata: {otpData: string, email: string}) : Promise<{success: boolean, message: string}>;
    resendOtp(resendOtpData: {email: string}) : Promise<{success: boolean, message: string}>;
    shipperLogin(userData: {email: string, password: string}) : Promise<{success: boolean, message: string, data?: Partial<IShipper>, accessToken?: string, refreshToken?: string}> ;
    getShipperProfileData(id: string):Promise<{success: boolean, message: string, shipperData?: Partial<IShipper>}> 
    registerKyc(shipperId: string, companyName: string, panNumber: string, gstNumber: string, aadhaarFront?: Express.Multer.File, aadhaarBack?: Express.Multer.File) : Promise<{success: boolean, message: string, shipperData?: Partial<IShipper>}>
}