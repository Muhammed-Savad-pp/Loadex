import { LoadData, userSignUp } from "../../interface/interface";
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

    console.log(formData ,'formData');
    
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

export const fetchBids = async (page: number, limit: number, status: string) => {

    const response = await api.get(`/shipper/fetchBids?page=${page}&limit=${limit}&status=${status}`);
    return response.data;

}

export const updateBidStatus = async (bidId: string, status: string) => {

    const response = await api.patch('/shipper/updateBidStatus', {bidId, status})
    return response.data;

}

export const fetchLoads = async (page: number, limit: number) => {

    const response = await api.get(`/shipper/fetchLoads?page=${page}&limit=${limit}`);
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

export const fetchTrips = async (page: number, limit: number, filterStatus: string) => {

    const response = await api.get(`/shipper/trips?page=${page}&limit=${limit}&status=${filterStatus}`);
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

export const fetchTransporters = async (page: number, limit: number, searchTerm: string) => {

    const response = await api.get(`/shipper/fetchTransporters?page=${page}&limit=${limit}&search=${searchTerm}`);
    return response.data
}

export const fetchTrucks = async (page: number, limit: number) => {

    const response = await api.get(`/shipper/fetchTrucks?page=${page}&limit=${limit}`);
    return response.data;

}

export const getShipperPlans = async () => {
    
    const response = await api.get('/shipper/subscriptionPlans');
    return response.data;

}

export const checkoutSubscription = async (planId: string) => {

    const response = await api.post('/shipper/subscription/create-checkout-session', {planId});    
    return response.data;

}

export const subscriptionSuccess = async (sessionId: string, planId: string) => {

    const response = await api.get(`/shipper/subscription-success?session_id=${sessionId}&planId=${planId}`);
    return response.data;

}

export const updateLoad = async (formData: LoadData) => {
        
    const response = await api.put('/shipper/updateLoad', {formData});
    return response.data;

}

export const deleteLoad = async (loadId: string) => {

    const response = await api.delete(`/shipper/load?loadId=${loadId}`);
    return response.data;
     
}

export const createChat = async (transporterId: string) => {

    const response = await api.post('/shipper/create-chat', {transporterId});
    return response.data;
}

export const fetchChats = async () => {

    const response = await api.get('/shipper/fetch-chats');
    return response.data;

}

export const fetchMessages = async (chatId: string) => {

    const response = await api.get(`/shipper/messages/${chatId}`);
    return response.data;
}

export const sendMessages = async (chatId: string, transporterId: string, message: string) => {

    const response = await api.post('/shipper/create-message', { chatId, transporterId, message});    
    return response.data;

}

export const getCurrentUserId = async () => {

    const response = await api.get('/shipper/me');
    return response.data;
}

export const updateMessageAsRead = async (chatId: string) => {

    const response = await api.patch(`/shipper/message-mark-as-read/${chatId}`);
    return response.data;
}

export const fecthShipperNotifications = async (filter: string) => {
    
    const response = await api.get(`/shipper/fetchNotifications?filter=${filter}`);
    return response.data;

}

export const updateNotificationAsRead = async (notificationId: string) => {

    const response = await api.patch('/shipper/notification-mark-as-read', {notificationId});
    return response.data;
}

export const deleteNotification = async (notificationId: string) => {

    const response = await api.delete(`/shipper/notification/${notificationId}`);
    return response.data;
}

export const fetchPaymentHistory = async (statusFilter: string, typeFilter: string, dateFilter: string, page: number, limit: number, search: string) => {
    
    const response = await api.get(`/shipper/paymentHistory?status=${statusFilter}&type=${typeFilter}&date=${dateFilter}&page=${page}&limit=${limit}&search=${search}`);
    return response.data;
}

export const findShipperUnReadNotificationCount = async () => {

    const response = await api.get('/shipper/unReadNotificationCount');
    return response.data
}