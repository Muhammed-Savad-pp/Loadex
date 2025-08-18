import bcrypt from "bcryptjs";
import { IOtp } from "../../models/otpModel";
import { generateAcessToken, generateRefreshToken, verifyToken } from "../../utils/Token.utils";
import { ITransporter } from "../../models/TransporterModel";
import { MailService } from "../../utils/mail";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { ITransporterRepository } from "../../repositories/interface/ITransporterRepository";
import { ITransporterAuthService } from "../../interface/transporter/ITransporterAuthService";
import { IOtpRepository } from "../../repositories/interface/IOtpRepository";

const mailService = new MailService()

async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
}

export const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
}

export class AuthService implements ITransporterAuthService {

    constructor (
        private _transporterRepository: ITransporterRepository,
        private _otpRepository: IOtpRepository
    ) { }

    async transporterSignup(transporterName: string, email: string, phone: string, password: string, confirmPassword: string): Promise<{ success: boolean, message: string}> {
            
        if(password != confirmPassword){
            return {success:false, message:"Password and confirmPassword do not match"}
        }

        const existingTransporter = await this._transporterRepository.findTransporterByEmail(email)
        if(existingTransporter && existingTransporter.isVerified){
            return {success: false, message: "userAlreadyExists"}
        }

        if(existingTransporter && !existingTransporter.isVerified) {  
            const getOtp = await this._otpRepository.findOtpByEmail(email);
            if(getOtp) {
                const currentTime = new Date().getTime();
                const expirationTime = new Date(getOtp.createdAt).getTime() + 2 * 60 * 1000;

                if(currentTime < expirationTime ) {
                    
                    return {success: true, message: "OTP is still valid. Please verify using the same OTP." };

                } else {

                    const newOtp = generateOtp();

                    await this._otpRepository.createOtp({email, otp:newOtp} as unknown as IOtp)

                    await mailService.sendOtpEmail(email, newOtp)

                    return {success: true, message: "Otp expired. A new Otp has been sent to your email."}

                }

            } else {

                const newOtp = generateOtp();

                await this._otpRepository.createOtp({email, otp: newOtp} as unknown as IOtp);

                await mailService.sendOtpEmail(email, newOtp);
                
                return {success: true, message: 'No OTP found. A new otp has been sent to your email'}

            }
        }

        const hashedPassword = await hashPassword(password)

        const savedTransporter = await this._transporterRepository.createTransporter({
            transporterName:transporterName,
            email: email,
            phone: phone,
            password: hashedPassword
        })

        const newOtp = generateOtp();
        console.log(newOtp)

        await this._otpRepository.createOtp({email, otp:newOtp} as unknown as IOtp)
        
        await mailService.sendOtpEmail(email, newOtp)

        return {success: true, message: "TransporterCreated"}

    }

    async verifyTransporterOtp(otpdata:{otpData: string; email: string}): Promise<{success: boolean; message: string}> {

        const {otpData, email } = otpdata;

        const validUser = await this._transporterRepository.findTransporterByEmail(email)

        if(!validUser) {
            return {success: false, message: "This email is not registered"}
        }

        const currentOtp = await this._otpRepository.findOtpByEmail(email);

        if(!currentOtp?.otp) return {success: false, message: "Resend the otp"};

        if(currentOtp.otp === otpData) {

            await this._transporterRepository.verifyTransporter(email, true);

            await this._otpRepository.deleteOtpByEmail(email);

            return {success: true, message: "Otp verification completed"}
            
        } else {

            return {success: false,  message: "Please enter valid otp"}
        } 
    }

    async transporterLogin(userData:{email: string, password: string}): Promise<{success: boolean, message: string, accessToken?: string, refreshToken?: string}> {

        const {email, password} = userData;

        const existingTransporter = await this._transporterRepository.findTransporterByEmail(email);

        if(!existingTransporter){
            return {success: false, message: 'Invalid Crediantional'}
        }

        const validPassword = await bcrypt.compare(password, existingTransporter.password)
        if(!validPassword){
            return {success: false, message: 'Invalid password'}
        }

        if(existingTransporter && existingTransporter.isBlocked){
            return {success: false, message: 'The Transporter is blocked'}
        }

        const transporterData :  Partial<ITransporter> = {
            transporterName: existingTransporter.transporterName,
            email:existingTransporter.email
        }

        const { ...data } = existingTransporter

        const accessToken = await generateAcessToken(data._id as string, 'transporter');
        const refreshToken = await generateRefreshToken(data._id as string, 'transporter');
        
        return {success: true, message:"Logged SuccessFully", accessToken, refreshToken}
        
    }

    async resendOtp(resendOtpData: {email: string}) : Promise<{success: boolean, message: string}> {

        const email = resendOtpData.email;

        const otp = generateOtp();

        try {

            const existingEmail = await this._otpRepository.findOtpByEmail(email);

            if(existingEmail) {
                
                await this._otpRepository.updateOtpByEmail(email, otp)
            
            } else {

                await this._otpRepository.createOtp({email, otp:otp} as unknown as IOtp)

            }

            await mailService.sendOtpEmail(email, otp);

            return {success: true, message: "New Otp sended"}
            
        } catch (error) {
            return {success: false, message:"failed to resend otp"}
        }
    }

    async validateRefreshToken(token: string) : Promise<{ accessToken?: string, refreshToken?: string}> {
        try {
            
            const decoded = verifyToken(token);

            const transporter = await this._transporterRepository.findTransporterById(decoded.transporterId)

            if(!transporter) {
                const error: any = new Error('transporter not found');
                error.status = HTTP_STATUS.NOT_FOUND;
                throw error;
            }

            const accessToken = await generateAcessToken(transporter._id as string, 'transporter');
            const refreshToken = await generateRefreshToken(transporter._id as string, 'transporter');            

            return { accessToken: accessToken, refreshToken: refreshToken}

        } catch (error) {
           console.error('error while storing refreshToken', error)
           throw error
        }
    }

    async forgotPassword (email: string): Promise<{success: boolean, message: string}> {
        try {
            
            const transporter = await this._transporterRepository.findTransporterByEmail(email);
            console.log(transporter);

            if(!transporter){
                return {success: false, message:'Transporter Not Registered'}
            }

            const newOtp = generateOtp();

            await this._otpRepository.createOtp({email, otp:newOtp} as unknown as IOtp)
        
            await mailService.sendOtpEmail(email, newOtp)

            return {success: true, message: 'Otp send successfully'}

        } catch (error) {
            console.log(error);
            return {success: false, message: 'Error in service'}
        }
    }

    async setNewPassword(email: string, password: string): Promise<{success: boolean, message: string}> {
        try {
            
            const transporter = await this._transporterRepository.findTransporterByEmail(email);

            const hashedPassword = await hashPassword(password);
            const id = String(transporter?._id);

            await this._transporterRepository.updateTransporterById(id, {password: hashedPassword})
            
            return {success: true, message: 'Password Changed SuccessFully'}

        } catch (error) {
            console.log(error);
            return {success: false, message:'New Password Change is failed'}
        }
    }

    async googleLogin(name: string, email: string): Promise<{ success: boolean; message: string; accessToken?: string; refreshToken?: string; }> {
        try {

            const existingTransporter = await this._transporterRepository.findTransporterByEmail(email);
            console.log(existingTransporter);

            if(!existingTransporter) {

                const savedTransporter = await this._transporterRepository.createTransporter({
                    transporterName:name,
                    email: email,
                    phone: 'Not Provided',
                    password: '',
                    isVerified: true
                })    

            }

            if(existingTransporter  && existingTransporter.isBlocked) {
                return {success: false, message: 'The Transporter is blocked'}
            }
           
            const { ...data } = existingTransporter

            const accessToken = await generateAcessToken(data._id as string, 'transporter');
            const refreshToken = await generateRefreshToken(data._id as string, 'transporter');

            return {success: true, message:"Logged SuccessFully", accessToken, refreshToken}
            
        } catch (error) {
            console.log(error);
            return {success: false, message: 'Login failed'}
        }
    }
}