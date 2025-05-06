import { publicApiClinet } from "../axiosInstance/axiosInstance";
import { axiosInstance } from "../axiosInstance/axiosInstance";

const publicApi = publicApiClinet;
const apiClient = axiosInstance


export const adminLogin = async (email: string, password: string) => {

    const response = await publicApi.post('/admin/login', {email,password }) 
    return response.data as {success: boolean, token: string, role: string}

}

export const getTransporter = async () => {
    
    const response = await apiClient.get('/admin/transporters')
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

export const getShipper = async () => {

    const response = await apiClient.get('/admin/fetchShipper');
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


export const getLoads = async () => {
    
    const response = await apiClient.get('/admin/fetchLoads');
    return response.data;
    
}
