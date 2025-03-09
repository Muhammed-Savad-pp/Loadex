import Otp, { IOtp } from "../../models/transporter/otpModel";
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
        console.log("here 2");

        const newOtp = new this.model(otpData);
        return await newOtp.save();
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
        await Otp.updateOne({ email }, { otp, createdAt: new Date() })
    }

    async deleteOtpByEmail(email: string): Promise<void> {
        await Otp.deleteOne({ email })
    }
} 

export default new OtpRepository()