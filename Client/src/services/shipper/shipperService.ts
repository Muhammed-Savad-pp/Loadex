import { userSignUp } from "../../interface/interface";
import { axiosInstance, publicApiClinet } from "../axiosInstance/axiosInstance";

const publicApi = publicApiClinet;
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

    const response = await publicApi.post<IResponse>('/shipper/auth/register', userData);
    return response.data;

}

export const shipperOtpVerify = async (otpData: string, email: string) : Promise<IResponse> => {

    const response = await publicApi.post<IResponse>('/shipper/auth/verifyOtp', {otpData, email});
    return response.data;

}

export const shipperResendOtp = async (email: string) : Promise<IResponse> => {

    const response = await publicApi.post<IResponse>('/shipper/auth/resendOtp', {email});
    return response.data;

}

export const shipperLoginRequest = async(email: string, password: string) : Promise<IResponse> => {

    const response = await publicApi.post<IResponse>('/shipper/auth/login', {email, password});
    return response.data
    
}

export const shipperLogout = async(): Promise<IResponse> => {
    
    const response = await publicApi.post<IResponse>('/shipper/auth/logout');
    return response.data
    
}

export const getShipperProfile = async() => {

    const response = await api.get('/shipper/profile');
    return response.data;

}

export const shipperKycSumbit = async (formData: FormData) => {

    const response = await api.post('/shipper/kycRegister', formData, {
        headers: {
           'Content-Type': 'multipart/form-data',
        }
    });

    return response.data;
}