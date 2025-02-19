import { TransporterRepositories } from "../../repositories/implementaion/transporter/transporterRepositories";
import bcrypt from "bcryptjs";
import { OtpRepository } from "../../repositories/implementaion/otpRepositories";
import { IOtp } from "../../models/transporter/otpModel";
import { generateAcessToken, generateRefreshToken } from "../../utils/transporterToken.utils";
import { ITransporter } from "../../models/transporter/TransporterModel";
import { MailService } from "../../utils/mail";


const mailService = new MailService()

async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
}

export const generateOtp = () => {

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    return otp;
}

interface TransporterData {
    transporterName : string;
    email: string
}


export class AuthService {
    
    private transporterRepositories: TransporterRepositories;
    private otpRepository: OtpRepository;

    constructor() {
        this.transporterRepositories = new TransporterRepositories();
        this.otpRepository = new OtpRepository;
    }

    async transporterSignup(transporterName: string, email: string, phone: string, password: string, confirmPassword: string): Promise<{ success: boolean, message: string}> {
            
        if(password != confirmPassword){
            return {success:false, message:"Password and confirmPassword do not match"}
        }

        const existingTransporter = await this.transporterRepositories.findTransporterByEmail(email)

        if(existingTransporter && existingTransporter.isVerified){

            return {success: false, message: "userAlreadyExists"}
            
        }

        if(existingTransporter && !existingTransporter.isVerified) {

            const getOtp = await this.otpRepository.findOtpByEmail(email);
            
            if(getOtp) {

                const currentTime = new Date().getTime();
                
                const expirationTime = new Date(getOtp.createdAt).getTime() + 2 * 60 * 1000;
                

                if(currentTime < expirationTime ) {
                    
                    return {success: true, message: "OTP is still valid. Please verify using the same OTP." };

                } else {

                    const newOtp = generateOtp();

                    await this.otpRepository.createOtp({email, otp:newOtp} as unknown as IOtp)

                    await mailService.sendOtpEmail(email, newOtp)

                    return {success: true, message: "Otp expired. A new Otp has been sent to your email."}

                }

            } else {

                const newOtp = generateOtp();

                await this.otpRepository.createOtp({email, otp: newOtp} as unknown as IOtp);

                await mailService.sendOtpEmail(email, newOtp);
                
                return {success: true, message: 'No OTP found. A new otp has been sent to your email'}

            }
        }

        const hashedPassword = await hashPassword(password)

        const savedTransporter = await this.transporterRepositories.createTransporter({
            transporterName:transporterName,
            email: email,
            phone: phone,
            password: hashedPassword
        })

        const newOtp = generateOtp();
        console.log(newOtp)

        await this.otpRepository.createOtp({email, otp:newOtp} as unknown as IOtp)
        
        await mailService.sendOtpEmail(email, newOtp)

        return {success: true, message: "TransporterCreated"}

    }

    async verifyTransporterOtp(otpdata:{otpData: string; email: string}): Promise<{success: boolean; message: string}> {

        const {otpData, email } = otpdata;

        const validUser = await this.transporterRepositories.findTransporterByEmail(email)

        if(!validUser) {
            return {success: false, message: "This email is not registered"}
        }

        const currentOtp = await this.otpRepository.findOtpByEmail(email);

        if(!currentOtp?.otp) return {success: false, message: "Resend the otp"};

        if(currentOtp.otp === otpData) {

            await this.transporterRepositories.verifyTransporter(email, true);

            await this.otpRepository.deleteOtpByEmail(email);

            return {success: true, message: "Otp verification completed"}
            
        } else {

            return {success: false,  message: "Please enter valid otp"}
        } 
    }

    async transporterLogin(userData:{email: string, password: string}): Promise<{success: boolean, message: string, data?:TransporterData,   accessToken?: string, refreshToken?: string}> {

        const {email, password} = userData;

        const existingTransporter = await this.transporterRepositories.findTransporterByEmail(email);

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

        

        const transporterData :  TransporterData = {
            transporterName: existingTransporter.transporterName,
            email:existingTransporter.email
        }

        const { ...data } = existingTransporter

        const accessToken = await generateAcessToken(data._id as string, 'transporter');
        const refreshToken = await generateRefreshToken(data._id as string, 'transporter');
        
        return {success: true, message:"Logged SuccessFully",data: transporterData, accessToken, refreshToken}
        

    }

    async resendOtp(resendOtpData: {email: string}) : Promise<{success: boolean, message: string}> {

        console.log(resendOtpData.email, 'serviceEmail')

        const email = resendOtpData.email;

        const otp = generateOtp();

        try {

            const existingEmail = await this.otpRepository.findOtpByEmail(email);

            if(existingEmail) {
                
                await this.otpRepository.updateOtpByEmail(email, otp)
            
            } else {

                await this.otpRepository.createOtp({email, otp:otp} as unknown as IOtp)

            }

            await mailService.sendOtpEmail(email, otp);

            return {success: true, message: "New Otp sended"}
            
        } catch (error) {
            return {success: false, message:"faled to resend otp"}
        }

        
    }
}