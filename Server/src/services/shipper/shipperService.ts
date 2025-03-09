import bcrypt from "bcryptjs";
import { generateOtp } from "../transporter/authService";
import { IOtp } from "../../models/transporter/otpModel";
import { MailService } from "../../utils/mail";
import { generateAcessToken, generateRefreshToken } from "../../utils/Token.utils";
import { IShipper } from "../../models/shipper/ShipperModel";
import { IShipperService } from "../../interface/shipper/IShipperService";
import { IShipperRepository } from "../../repositories/interface/IShipperRepository";
import { IOtpRepository } from "../../repositories/interface/IOtpRepository";
import s3 from "../../config/s3Config";
import { PutObjectCommand } from "@aws-sdk/client-s3";


async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
}

const mailService = new MailService();


export class ShipperService implements IShipperService {

    // private shipperRepositories : ShipperRepositories;
    // private otpRepositories : OtpRepository;

    // constructor(){
    //     this.shipperRepositories = new ShipperRepositories();
    //     this.otpRepositories = new OtpRepository();
    // }

    constructor(
        private shipperRepositories: IShipperRepository,
        private otpRepositories: IOtpRepository
    ) {}

    async shipperSignUp(shipperName: string, email: string, phone: string, password: string, confirmPassword: string): Promise<{success: boolean, message: string}> {

        if(password !== confirmPassword) {
            return {success: false, message: 'Password and ConfirmPassword do not match'}
        }

        const existingShipper = await this.shipperRepositories.findShipperByEmail(email);

        if(existingShipper && existingShipper.isVerified) {
            return {success: false, message: 'shipperAlreadyExists'}
        }

        if(existingShipper && !existingShipper.isVerified) {

            const getOtp = await this.otpRepositories.findOtpByEmail(email);

            if(getOtp) {

                const currentTime = new Date().getTime();

                const expirationTime = new Date(getOtp.createdAt).getTime() + 2 * 60 * 1000;

                if(currentTime < expirationTime) {
                    return {success : true, message: 'OTP is still valid. Please verify using same OTP.'}
                } else {

                    const newOtp = generateOtp();

                    await this.otpRepositories.createOtp({email, otp: newOtp} as unknown as IOtp);

                    await mailService.sendOtpEmail(email, newOtp);

                    return {success: true, message: "OTP expired. A new OTP has been sent to your email"}
                
                } 
            
            } else {

                const newOtp = generateOtp();

                await this.otpRepositories.createOtp({email, otp: newOtp} as unknown as IOtp);

                await mailService.sendOtpEmail(email, newOtp)

                return {success: true, message: 'no OTP found. A new otp has been sent to your email '}

            }

        }


        const hashedPassword = await hashPassword(password);

        const savedShipper = await this.shipperRepositories.createShipper({
            shipperName: shipperName,
            email: email,
            phone: phone,
            password: hashedPassword,
        })

        const newOtp = generateOtp();

        await this.otpRepositories.createOtp({email, otp: newOtp} as unknown as IOtp);

        await mailService.sendOtpEmail(email, newOtp)

        return {success: true, message: 'shipperCreated'}

    }

    async verifyShipperOtp (otpdata: {otpData: string, email: string}) : Promise<{success: boolean, message: string}> {

        const {otpData, email } = otpdata;

        const validUser = await this.shipperRepositories.findShipperByEmail(email);

        if(!validUser) {
            return {success: false, message:'This Email not registered'}
        }

        const currentOtp = await this.otpRepositories.findOtpByEmail(email);

        if(!currentOtp?.otp) return {success: false, message:'Resend the OTP'}

        if(currentOtp.otp ===  otpData) {

            await this.shipperRepositories.verifyShipper(email, true);

            await this.otpRepositories.deleteOtpByEmail(email);

            return {success: true, message: "OTP Verification Completed"}
        } else {
            return {success: false, message: 'Please Enter Valid OTP'}
        }

    }

    async resendOtp(resendOtpData: {email: string}) : Promise<{success: boolean, message: string}> {
        
        const email = resendOtpData.email;
        const otp = generateOtp();

        try {

            const existingEmail = await this.otpRepositories.findOtpByEmail(email);

            if(existingEmail) {

                await this.otpRepositories.updateOtpByEmail(email, otp)
            
            } else {

                await this.otpRepositories.createOtp({email, otp} as unknown as IOtp)
            }

            await mailService.sendOtpEmail(email, otp);

            return {success: true, message: "New Otp Sended"}

        } catch (error) {
            console.log(error)
            return {success: false, message: 'failed to resend OTP'}
        }
    }

    async shipperLogin(userData: {email: string, password: string}) : Promise<{success: boolean, message: string, data?: Partial<IShipper>, accessToken?: string, refreshToken?: string}> {

        const {email, password} = userData;

        const existingShipper = await this.shipperRepositories.findShipperByEmail(email);

        if(!existingShipper) {
            return {success: false, message: 'Invalid Crediantional'}
        }

        const validPassword = await bcrypt.compare(password, existingShipper.password);

        if(!validPassword) {
            return {success: false, message: 'Invalid Password'}
        }

        if(existingShipper && existingShipper.isBlocked) {
            return {success: false, message: "The Shipper is Blocked"}
        }

        const shippperData: Partial<IShipper> = {
            shipperName: existingShipper.shipperName,
            email: existingShipper.email
        }

        const { ...data } = existingShipper;

        const accessToken = await generateAcessToken(data._id as string, 'shipper');
        const refreshToken = await generateRefreshToken(data._id as string, 'shipper');

        return {success: true, message: "Logged SuccessFully", data:shippperData, accessToken, refreshToken}

    }

    async getShipperProfileData(id: string): Promise<{ success: boolean; message: string; shipperData?: Partial<IShipper>; }> {
        try {
            
            const shipperData = await this.shipperRepositories.findById(id)

            if(!shipperData){
                return {success: false, message: 'Shipper not found'}
            }


            return {success : true, message: 'Shipper Find Successfully', shipperData: shipperData};

        } catch (error) {
            console.error('error in shipperService ', error)
            return {success: false, message: 'error in GetShipperProfiledData'}
        }
    }

    async registerKyc(shipperId: string, companyName: string, panNumber: string, gstNumber: string, aadhaarFront?: Express.Multer.File, aadhaarBack?: Express.Multer.File): Promise<{ success: boolean; message: string; shipperData?: Partial<IShipper>; }> {
        try {

            let aadhaarFrontUrl: string | undefined;
            let aadhaarBackUrl: string | undefined;

            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
                const s3Params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: `${folder}/shipper/${Date.now()}_${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(s3Params)
                await s3.send(command)

                return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Params.Key}`;
            }

            if(aadhaarFront){
                aadhaarFrontUrl = await uploadToS3(aadhaarFront, 'aadhaar-front');
            }

            if(aadhaarBack){
                aadhaarBackUrl = await uploadToS3(aadhaarBack, 'aadhaar-back');
            }

            const updateShipper = await this.shipperRepositories.updateShipperById(
                shipperId,
                {
                    companyName,
                    panNumber,
                    gstNumber,
                    aadhaarFront: aadhaarFrontUrl,
                    aadhaarBack: aadhaarBackUrl,
                    verificationStatus: 'requested'
                }
            )

            if(!updateShipper) {
                return {success: false, message: 'Shipper not found'}
            }

            return {success: true, message: 'Kyc verification completed',
                shipperData: {
                    companyName: updateShipper.companyName,
                    gstNumber: updateShipper.gstNumber,
                    panNumber: updateShipper.panNumber,
                    aadhaarFront: updateShipper.aadhaarFront,
                    aadhaarBack: updateShipper.aadhaarBack,
                    verificationStatus: updateShipper.verificationStatus
                }
            }
            
        } catch (error) {
            console.error(error, 'error in service')
            return {success: false, message: 'Kyc verification failed '}
        }
        
    }

}