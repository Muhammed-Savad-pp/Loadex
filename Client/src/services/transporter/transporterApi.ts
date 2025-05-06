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

    const response = await apiClient.post('/transporter/registerTruck', formDataToSend, {
        headers: {
            'Content-type': 'multipart/form-data',
        },
    })

    return response.data
}

export const fetchLoads = async () => {

    const response = await apiClient.get('/transporter/fetchLoads');
    return response.data;

}

export const fetchTrucks = async () => {

    const response = await apiClient.get('/transporter/fetchTrucks');
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

export const fetchBids = async () => {

    const response = await apiClient.get('/transporter/fetchBids');
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

export const fetchTrips = async () => {

    const response = await apiClient.get('/transporter/trips');
    return response.data;

}

export const updateTripStatus = async (tripId: string, newStatus: string) => {

    const response = await apiClient.patch('/transporter/trip-status', { tripId, newStatus });
    return response.data

}

export const updateProfile = async (formData: FormData) => {

    const response = await apiClient.post('/transporter/updateProfile', formData, {
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

    const response = await apiClient.post('/transporter/postReview', {shipperId, rating, comment});
    return response.data;
    
}

export const listShipper = async () => {

    const response = await apiClient.get('/transporter/fetchShippers');
    return response.data;

}