import Otp, { IOtp } from "../../models/otpModel";
import { IOtpRepository } from "../interface/IOtpRepository";

import { BaseRepositories } from "./baseRepositories";


export interface IRepository<T> {
    create(item: T): Promise<T>
}

export class OtpRepository extends BaseRepositories<IOtp> implements IOtpRepository {

    constructor() {
        super(Otp)
    }

    async createOtp(otpData: IOtp): Promise<IOtp> {
        try {

            const newOtp = new this.model(otpData);
            return await newOtp.save();
            
        } catch (error) {
            console.log(error)
            throw new Error(error instanceof Error ? error.message : String(error))
        }
        
    }

    async findOtpByEmail(email: string): Promise<IOtp | null> {
        try {

            return await this.model.findOne({ email });

        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async updateOtpByEmail(email: string, otp: string): Promise<void> {
        try {

            await Otp.updateOne({ email }, { otp, createdAt: new Date() })
            
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
        
    }

    async deleteOtpByEmail(email: string): Promise<void> {
        try {
            
            await Otp.deleteOne({ email })

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }
} 

export default new OtpRepository()