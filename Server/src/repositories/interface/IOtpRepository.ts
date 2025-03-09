import { IOtp } from "../../models/transporter/otpModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IOtpRepository extends IBaseRepository<IOtp> {
    createOtp(otpData: IOtp): Promise<IOtp> ;
    findOtpByEmail(email: string): Promise<IOtp | null>;
    updateOtpByEmail(email: string, otp: string): Promise<void>;
    deleteOtpByEmail(email: string): Promise<void>
}