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

    const response = await apiClient.get('/admin/RequestTransporter');
    return response.data;

}

export const changeVerificationStatus = async (id: string,status: string) =>{

    const response = await apiClient.patch('/admin/VerificationStatus', {id, status});
    return response.data;

}

export const getShipper = async (search: string, page: number, limit: number) => {

    const response = await apiClient.get(`/admin/Shipper?search=${search}&page=${page}&limit=${limit}`);
    return response.data;
}

export const updateSipperStatus = async (id: string) =>{

    const response = await apiClient.patch('/admin/ShipperStatus', {id})
    return response.data
}

export const getRequestedShipper = async () => {

    const response = await apiClient.get('/admin/RequestShipper');
    return response.data;

}

export const changeShipperVerificationStatus = async (id: string, status: string) => {

    const response = await apiClient.patch('/admin/ShipperVerificationStatus', { id, status })
    return response.data;
    
}

// export const getRequestedTrucks = async () => {

//     const response = await apiClient.get('/admin/RequestTrucks');
//     return response.data;

// }

export const changeTruckVerificationStatus = async (id: string, status: string) => {

    const response = await apiClient.patch('/admin/TruckVerificationStatus', { id, status});
    return response.data;

}


// export const getLoads = async (page: number, limit: number, search: string, startDate: string, endDate: string) => {
    
//     const response = await apiClient.get(`/admin/Loads?page=${page}&limit=${limit}&search=${search}&startDate=${startDate}&endDate=${endDate}`);
//     return response.data;
    
// }

export const fetchDashBoardDatas = async () => {

    const response = await apiClient.get('/admin/DashboardDatas');    
    return response.data;
}

// export const fetchTrips = async(page: number, limit: number, search: string, status: string) => {

//     const response = await apiClient.get(`/admin/trips?page=${page}&limit=${limit}&search=${search}&status=${status}`);
//     return response.data;
// };

// export const sendTripAmountToTransporter = async(tripId: string, amount: string) => {

//     const response = await apiClient.post('/admin/sendTripAmountToTransporter', { tripId, amount});
//     return response.data
// }

export const fetchPaymentHistory = async (searchTerm: string, paymentStatus: string, userType: string, paymentfor: string, page: number, limit: number) => {

    const response = await apiClient.get(`/admin/paymentHistory?searchTerm=${searchTerm}&paymentStatus=${paymentStatus}&userType=${userType}&paymentfor=${paymentfor}&page=${page}&limit=${limit}`);    
    return response.data;
}

export const fetchRevenueByMonth = async () => {

    const response = await apiClient.get('/admin/revenue');
    return response.data;
}
