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

export const shipperSignup = async (userData: userSignUp) : Promise<IResponse> =>  {

    const response = await api.post<IResponse>('/shipper/register', userData);
    return response.data;

}

export const shipperOtpVerify = async (otpData: string, email: string) : Promise<IResponse> => {

    const response = await api.post<IResponse>('/shipper/verifyOtp', {otpData, email});
    return response.data;

}

export const shipperResendOtp = async (email: string) : Promise<IResponse> => {

    const response = await api.post<IResponse>('/shipper/resendOtp', {email});
    return response.data;

}

export const shipperLoginRequest = async(email: string, password: string) : Promise<IResponse> => {

    const response = await api.post<IResponse>('/shipper/login', {email, password});
    return response.data
    
}