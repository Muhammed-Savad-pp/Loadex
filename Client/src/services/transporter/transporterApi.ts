import { userSignUp } from "../../interface/interface";
import { publicApiClinet, axiosInstance } from "../axiosInstance/axiosInstance";

const PublicApi = publicApiClinet;
const apiClient = axiosInstance;

// interface IResponse {
//     success: boolean;
//     message: string;
//     data?: {transporterName: string, email: string};
//     accessToken?:string,
//     refreshToken?:string,
//     role?: string,
//     verificationStatus?: string,

// }


export const transporterSignUp = async (userData: userSignUp) => {

    const response = await PublicApi.post(`/transporter/auth/register`, userData)
    return response.data;

}

export const transporterOtpVerify = async (otpData: string, email: string) => {

    const response = await PublicApi.post('/transporter/auth/verifyOtp', { otpData, email });
    return response.data

}

export const transporterLoginRequest = async (email: string, password: string) => {

    const response = await PublicApi.post('/transporter/auth/login', { email, password });
    return response.data;

}

export const transporterResendOtp = async (email: string) => {

    const response = await PublicApi.post('/transporter/auth/resendOtp', { email })

    return response.data
}

export const transporterLogout = async() =>{

    const response = await PublicApi.post('/transporter/auth/logout')
    
    return response.data
}


export const getTransporterVerificationStatus = async () => {

    const response = await apiClient.get('/transporter/getVerificationStatus')

    return response.data
}

export const getTransporterProfile = async () => {

    const response = await apiClient.get('/transporter/profile');

    return response.data
}

export const transporterKYCSubmit = async (formData: FormData) => {
    
    const response = await apiClient.post('/transporter/kyc', formData, {

        headers: {
            'Content-Type': 'multipart/form-data',
        },

    });
    return response.data;
}


export const registerTruck = async (formDataToSend: FormData) => {

    formDataToSend.forEach((value, key) => {
        console.log(`${key} :` , value)
    })

    
    const response = await apiClient.post('/transporter/registerTruck', formDataToSend, {
        headers: {
            'Content-type' : 'multipart/form-data',
        }, 
    })
    
    return response.data
}