import { axiosInstance } from "../axiosInstance/axiosInstance";

const apiClient = axiosInstance

export const fetchTrucks = async (status: string, page: number, limit: number) => {

    const response = await apiClient.get(`/trucks/?status=${status}&page=${page}&limit=${limit}`);
    return response.data;
}

export const registerTruck = async (formDataToSend: FormData) => {

    const response = await apiClient.post('/trucks/truck', formDataToSend, {
        headers: {
            'Content-type': 'multipart/form-data',
        },
    })

    return response.data
}

export const activateTruck = async (formdata: FormData) => {

    const response = await apiClient.put('/trucks/activation/truck', formdata, {
        headers: {
            'Content-type': 'multipart/form-data'
        }
    });
    return response.data;
}

export const fetchActiveTruck = async () => {

    const response = await apiClient.get('/trucks/activeTruck');
    return response.data

}

export const updateTruck = async (updateData: FormData) => {

    const response = await apiClient.put('/trucks/truck', updateData, {
        headers: {
            'Content-type': 'multipart/form-data',
        }
    });

    return response.data;
}

export const fetchTrucksForShipper = async (page: number, limit: number) => {

    const response = await apiClient.get(`/trucks/shipper?page=${page}&limit=${limit}`);
    return response.data;

}

export const getRequestedTrucksForAdmin = async () => {

    const response = await apiClient.get('/trucks/requests/admin');
    return response.data;

}

export const changeTruckVerificationStatusByAdmin = async (id: string, status: string, rejectReason: string) => {

    const response = await apiClient.patch('/trucks/verification-status', { id, status, rejectReason });
    return response.data;

}