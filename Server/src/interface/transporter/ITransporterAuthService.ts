import { ITransporter } from "../../models/TransporterModel";

export interface ITransporterAuthService {

    transporterSignup(transporterName: string, email: string, phone: string, password: string, confirmPassword: string): Promise<{ success: boolean, message: string}>
    verifyTransporterOtp(otpdata:{otpData: string; email: string}): Promise<{success: boolean; message: string}>
    transporterLogin(userData:{email: string, password: string}): Promise<{success: boolean, message: string, data?: Partial<ITransporter>, accessToken?: string, refreshToken?: string}>
    resendOtp(resendOtpData: {email: string}) : Promise<{success: boolean, message: string}>
    validateRefreshToken(token: string) : Promise<{ accessToken?: string, refreshToken?: string}>
    forgotPassword (email: string): Promise<{success: boolean, message: string}>
    setNewPassword(email: string, password: string): Promise<{success: boolean, message: string}>;
    googleLogin(name: string, email: string): Promise<{success: boolean, message: string, transporterData?: Partial<ITransporter> | null, accessToken?: string, refreshToken?: string}>

}