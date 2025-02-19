import { userSignUp } from "../../interface/interface";
import { axiosInstance } from "../axiosInstance/axiosInstance";

const api = axiosInstance;

interface IResponse {
    success: boolean;
    message: string;
    data?: {transporterName: string, email: string};
    accessToken?:string,
    refreshToken?:string,
    role?: string,
}


export const transporterSignUp = async(userData:userSignUp): Promise<IResponse> => {
    
    const response = await api.post<IResponse>(`/transporter/register`, userData)
    return response.data;

}

export const transporterOtpVerify = async(otpData: string, email: string): Promise<IResponse> => {
    
    const response = await api.post<IResponse>('/transporter/verifyOtp', {otpData, email});
    return response.data 
    
}

export const transporterLoginRequest = async(email: string, password: string): Promise<IResponse> => {
 
    const response = await api.post<IResponse>('/transporter/login', {email, password});
    return response.data;

}

export const resendOtp = async(email: string): Promise<IResponse> => {

    const respone = await api.post<IResponse>('/transporter/resendOtp', {email})

    return respone.data
}