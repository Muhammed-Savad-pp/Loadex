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

export const transporterForgotPasswordEmailSubmit = async (email: string) => {

    const response = await publicApiClinet.post('/transporter/auth/forgotPassword', { email });
    return response.data;
}

export const tranpsorterNewPasswordSet = async (email: string, password: string) => {

    const response = await publicApiClinet.post('/transporter/auth/changePassword', { email, password });
    return response.data;

}

export const transporterLoginRequest = async (email: string, password: string) => {

    const response = await PublicApi.post('/transporter/auth/login', { email, password });
    return response.data;

}

export const transporterGoogleLogin = async (name: string, email: string) => {

    const response = await PublicApi.post('/transporter/auth/googleLogin', { name, email });
    return response.data;

}

export const transporterResendOtp = async (email: string) => {

    const response = await PublicApi.post('/transporter/auth/resendOtp', { email })
    return response.data
}

export const transporterLogout = async () => {

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

    

    const response = await apiClient.post('/transporter/truck', formDataToSend, {
        headers: {
            'Content-type': 'multipart/form-data',
        },
    })

    return response.data
}

export const fetchLoads = async (page: number , limit: number) => {

    const response = await apiClient.get(`/transporter/loads?page=${page}&limit=${limit}`);
    return response.data;

}

export const fetchTrucks = async (status: string, page: number, limit: number) => {

    console.log(limit, 'asdfa');
    
    const response = await apiClient.get(`/transporter/trucks?status=${status}&page=${page}&limit=${limit}`);
    return response.data;
}

export const activateTruck = async (formdata: FormData) => {

    formdata.forEach((val, ind) => {
        console.log(val, ind, 'inservice');
    })

    const response = await apiClient.put('/transporter/activateTruck', formdata, {
        headers: {
            'Content-type': 'multipart/form-data'
        }
    });
    return response.data;

}

export const sendBid = async (formData: FormData) => {

    formData.forEach((val, ind) => {
        console.log(val, ind, "in service");

    })
    const response = await apiClient.post('/transporter/sendBid', formData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response.data;

}

export const fetchBids = async (page: number, limit: number, status: string) => {

    const response = await apiClient.get(`/transporter/bids?page=${page}&limit=${limit}&status=${status}`);
    return response.data;

}

export const bidCheckoutSession = async (bidId: string) => {

    const response = await apiClient.post('/transporter/bid-checkout-session', { bidId });
    return response.data;

}

export const bidVerifyPayment = async (transactionId: string | null, status: string) => {

    const resposne = await apiClient.post('/transporter/payment-bid-verification', { transactionId, status });
    return resposne.data;

}

export const fetchTrips = async (status: string, page: number, limit: number) => {

    const response = await apiClient.get(`/transporter/trips?status=${status}&page=${page}&limit=${limit}`);
    return response.data;

}

export const updateTripStatus = async (tripId: string, newStatus: string) => {

    const response = await apiClient.patch('/transporter/trip-status', { tripId, newStatus });
    return response.data

}

export const updateProfile = async (formData: FormData) => {

    const response = await apiClient.post('/transporter/profile', formData, {
        headers: {
            'Content-type': 'multipart/form-data'
        }
    })

    return response.data;
}

export const getShipperData = async (shipperId: string) => {
    
    const response = await apiClient.get(`/transporter/shipperProfileData/${shipperId}`);
    return response.data;

}

export const followShipper = async (shipperId: string) => {

    const response = await apiClient.post('/transporter/followShipper', {shipperId});
    return response.data;

}

export const unfollowShipper = async (shipperId: string) => {

    const response = await apiClient.post('/transporter/unfollowShipper', {shipperId});
    return response.data;
    
}

export const postReview = async (shipperId: string, rating: number, comment: string) => {

    const response = await apiClient.post('/transporter/review', {shipperId, rating, comment});
    return response.data;
    
}

export const listShipper = async (page: number, limit: number, search: string) => {

    const response = await apiClient.get(`/transporter/shippers?page=${page}&limit=${limit}&search=${search}`);
    return response.data;

}

export const fetchFollowerAndFollowingDetails = async (status: string, search: string, page: number, limit: number) => {

    const response = await apiClient.get(`/transporter/followersDetails?status=${status}&search=${search}&page=${page}&limit=${limit}`);
    return response.data;
    
}

export const fetchTransporterPlans = async () => {

    const response = await apiClient.get('/transporter/subscriptionPlans');
    return response.data;

}

export const createCheckoutSubscription = async (planId: string) => {

    const response = await apiClient.post('/transporter/subscription/create-checkout-session', {planId});
    return response.data

}

export const subscriptionSuccess = async (sessionId: string, planId: string) => {

    const response = await apiClient.put('/transporter/subscription-success', { sessionId, planId });
    return response.data;

}

export const fetchActiveTruck = async () => {

    const response = await apiClient.get('/transporter/activeTruck');
    return response.data
    
}

export const updateBid = async (bidId: string, truckId: string, price: string) => {

    const response = await apiClient.put('/transporter/bid', { bidId, truckId, price })
    return response.data;    
}

export const deleteBid = async (bidId: string) => {
    
    const response = await apiClient.delete(`/transporter/bid?bidId=${bidId}`);
    return response.data;
}

export const fetchPaymentHistory = async (statusFilter: string, typeFilter: string, dateFilter: string, page: number, limit: number) => {
    
    const response = await apiClient.get(`/transporter/paymentHistory?status=${statusFilter}&type=${typeFilter}&date=${dateFilter}&page=${page}&limit=${limit}`);
    return response.data;
}

export const createChat = async (shipperId: string) => {

    const response = await apiClient.post('/transporter/chat', { shipperId });
    return response.data;
}

export const fetchChats = async () => {

    const response = await apiClient.get('/transporter/chats');
    return response.data;
}

export const sendMessages = async (chatId: string, shipperId: string, message: string) => {

    const response = await apiClient.post('/transporter/message', {chatId, shipperId, message});
    return response.data;
}

export const fetchMessages = async (chatId: string) => {

    const response = await apiClient.get(`/transporter/messages/${chatId}`);
    return response.data;
}

export const fetchCurrentTransporterId = async () => {

    const response = await apiClient.get('/transporter/me');
    return response.data;
}

export const updateMessageAsRead = async (chatId: string) => {

    const response = await apiClient.patch(`/transporter/mark-messsage-as-read/${chatId}`); 
    return response.data
}

export const fetchNotifcations = async (filter: string) => {

    const response = await apiClient.get(`/transporter/notifications?filter=${filter}`);
    return response.data;
}

export const updateNotificationAsRead = async (notificationId: string) => {

    const response = await apiClient.patch('/transporter/notification-mark-as-read', {notificationId});
    return response.data;
}

export const deleteNotification = async (notificationId: string) => {

    const response = await apiClient.delete(`/transporter/notification/${notificationId}`);    
    return response.data;
}

export const fetchWalletData = async () => {

    const response = await apiClient.get('/transporter/wallet'); 
    return response.data;   
}

export const bidPaymentByWallet = async (bidId: string) => {

    const response = await apiClient.post('/transporter/bidPaymentByWallet', { bidId });
    return response.data;
}

export const findTransporterUnreadNotificationCount = async () => {

    const response = await apiClient.get('/transporter/unreadNotificationCount');
    return response.data;

}

export const updateTruck = async (updateData: FormData) => {

    console.log(updateData)
    const response = await apiClient.put('/transporter/truck', updateData, {
        headers: {
            'Content-type': 'multipart/form-data',
        }
    });

    return response.data;
} 