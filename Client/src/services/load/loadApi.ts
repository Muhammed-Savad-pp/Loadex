import { LoadData } from "../../interface/interface";
import { IFormData } from "../../pages/shipper/PostLoad";
import { axiosInstance } from "../axiosInstance/axiosInstance"

const apiClient = axiosInstance;

export const postLoad = async (formData: IFormData) => {
    const response = await apiClient.post('/loads/load', { formData });
    return response.data;
}

export const fetchLoadsForShipper = async (page: number, limit: number) => {
    const response = await apiClient.get(`/loads/?page=${page}&limit=${limit}`);
    return response.data;
}

export const updateLoad = async (formData: LoadData) => {
    const response = await apiClient.put('/loads/load', { formData });
    return response.data;
}

export const deleteLoad = async (loadId: string) => {
    const response = await apiClient.delete(`/loads/load/${loadId}`);
    return response.data;
}

export const getLoadForAdmin = async (page: number, limit: number, search: string, startDate: string, endDate: string) => {
    const response = await apiClient.get(`/loads/admin/loads?page=${page}&limit=${limit}&search=${search}&startDate=${startDate}&endDate=${endDate}`);
    return response.data;
}

export const fetchLoadsForTransporter = async (page: number , limit: number) => {
    const response = await apiClient.get(`/loads/transporter-loads?page=${page}&limit=${limit}`);
    return response.data;
}
