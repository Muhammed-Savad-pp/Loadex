import { publicApiClinet } from "../axiosInstance/axiosInstance";
import { axiosInstance } from "../axiosInstance/axiosInstance";

const publicApi = publicApiClinet;
const apiClient = axiosInstance


export const adminLogin = async (email: string, password: string) => {

    const response = await publicApi.post('/admin/login', {email,password }) 
    return response.data as {success: boolean, token: string, role: string}

}

export const getTransporter = async (search: string,page: number, limit: number) => {
    
    const response = await apiClient.get(`/admin/transporters?search=${search}&page=${page}&limit=${limit}`);
    return response.data

}

export const adminLogout = async () => {
        
    const response = await publicApi.post('/admin/logout');
    return response.data

}

export const updateTransporterBlockandUnblock = async (id: string) => {

    const response = await apiClient.patch('/admin/transporterBlockandUnblock', {id});
    return response.data

}

export const getRequestTransporter = async () => {

    const response = await apiClient.get('/admin/fetchRequestTransporter');
    return response.data;

}

export const changeVerificationStatus = async (id: string,status: string) =>{

    const response = await apiClient.patch('/admin/changeVerificationStatus', {id, status});
    return response.data;

}

export const getShipper = async (search: string, page: number, limit: number) => {

    const response = await apiClient.get(`/admin/fetchShipper?search=${search}&page=${page}&limit=${limit}`);
    return response.data;
}

export const updateSipperStatus = async (id: string) =>{

    const response = await apiClient.patch('/admin/changeShipperStatus', {id})
    return response.data
}

export const getRequestedShipper = async () => {

    const response = await apiClient.get('/admin/fetchRequestShipper');
    return response.data;

}

export const changeShipperVerificationStatus = async (id: string, status: string) => {

    const response = await apiClient.patch('/admin/changeShipperVerificationStatus', { id, status })
    return response.data;
    
}

export const getRequestedTrucks = async () => {

    const response = await apiClient.get('/admin/fetchRequestTrucks');
    return response.data;

}

export const changeTruckVerificationStatus = async (id: string, status: string) => {

    const response = await apiClient.patch('/admin/changeTruckVerificationStatus', { id, status});
    return response.data;

}


export const getLoads = async (page: number, limit: number) => {
    
    const response = await apiClient.get(`/admin/fetchLoads?page=${page}&limit=${limit}`);
    return response.data;
    
}

export const fetchDashBoardDatas = async () => {

    const response = await apiClient.get('/admin/fetchDashboardDatas');    
    return response.data;
}

export const fetchTrips = async(page: number, limit: number) => {

    const response = await apiClient.get(`/admin/trips?page=${page}&limit=${limit}`);
    return response.data;
};

export const sendTripAmountToTransporter = async(tripId: string, amount: string) => {

    const response = await apiClient.post('/admin/sendTripAmountToTransporter', { tripId, amount});
    return response.data
}

export const fetchPaymentHistory = async (searchTerm: string, paymentStatus: string, userType: string, paymentfor: string, page: number, limit: number) => {

    const response = await apiClient.get(`/admin/paymentHistory?searchTerm=${searchTerm}&paymentStatus=${paymentStatus}&userType=${userType}&paymentfor=${paymentfor}&page=${page}&limit=${limit}`);
    console.log(response, 'resposne in serve');
    
    return response.data;
}
