import { userSignUp } from "../../interface/interface";
import { axiosInstance, publicApiClinet } from "../axiosInstance/axiosInstance";
import { IFormData } from "../../pages/shipper/PostLoad";

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

export const shipperGoogleLogin = async (name: string, email: string) => {

    const response = await publicApi.post('/shipper/auth/googleLogin', {name, email});
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

export const postLoad = async (formData: IFormData) => {

    const response = await api.post('/shipper/postLoad', {formData});
    return response.data;
}

export const getShipperVerificatinStatus = async () => {

    const response = await api.get('/shipper/getVerificationStatus');
    return response.data;

}

export const shipperForgotPasswordEmailSubmit = async (email: string) => {

    const response = await publicApi.post('/shipper/auth/forgotPassword', { email })
    return response.data

}

export const shipperNewPasswordSet = async (email: string, password: string) => {

    const response = await publicApi.post('/shipper/auth/changePassword', {email, password});
    return response.data 

}

export const fetchBids = async () => {

    const response = await api.get('/shipper/fetchBids');
    return response.data;

}

export const updateBidStatus = async (bidId: string, status: string) => {

    const response = await api.patch('/shipper/updateBidStatus', {bidId, status})
    return response.data;

}

export const fetchLoads = async () => {

    const response = await api.get('/shipper/fetchLoads');
    return response.data;
    
}

export const checkoutSession = async (bidId: string) => {

    const response = await api.post('/shipper/checkout-session', {bidId});
    return response.data;
    
}

export const verifyBidPayment = async (sessionId: string |null, status:  string) => {
    
    const response = await api.post('/shipper/verifyPayment', {sessionId, status});
    return response.data;

}

export const fetchTrips = async () => {

    const response = await api.get('/shipper/trips');
    return response.data;

}

export const updateProfile = async (formData: FormData) => {

    const response = await api.post('/shipper/updateProfile', formData, {
        headers: {
           'Content-Type': 'multipart/form-data',
        }
    })

    return response.data;

}

export const fetchTransporterDetails = async (transporterId: string) => {

    const response = await api.get(`/shipper/transporterDetails/${transporterId}`);
    return response.data;

}

export const followTransporter = async (transporterId: string) => {

    const response = await api.post('/shipper/followTransporter', {transporterId});
    return response.data;

}

export const unFollowTransporter = async (transporterId: string) => {

    const response = await api.post('/shipper/unfollowTransporter', {transporterId});
    return response.data;

}

export const postReview = async (transporterId: string, rating: number, comment: string) => {    

    const response = await api.post('/shipper/postReview', {transporterId, rating, comment});
    return response.data;

}

export const fetchTransporters = async () => {

    const response = await api.get('/shipper/fetchTransporters');
    return response.data
}

export const fetchTrucks = async () => {

    const response = await api.get('/shipper/fetchTrucks');
    return response.data;

}
