import { axiosInstance } from "../axiosInstance/axiosInstance";

const api = axiosInstance;

export const fetchTripsForTransporter = async (status: string, page: number, limit: number) => {

    const response = await api.get(`/trips/trip-transporter?status=${status}&page=${page}&limit=${limit}`);
    return response.data;

}

export const updateTripStatus = async (tripId: string, newStatus: string) => {

    const response = await api.patch('/trips/trip-status', { tripId, newStatus });
    return response.data

}

export const fetchTripsForShipper = async (page: number, limit: number, filterStatus: string) => {

    const response = await api.get(`/trips/trip-shipper?page=${page}&limit=${limit}&status=${filterStatus}`);
    return response.data;

}

export const fetchTripsForAdmin = async(page: number, limit: number, search: string, status: string) => {

    const response = await api.get(`/trips/trip-admin?page=${page}&limit=${limit}&search=${search}&status=${status}`);
    return response.data;
};

export const sendTripAmountToTransporter = async(tripId: string, amount: string) => {

    const response = await api.post('/trips/pay-trip-amount', { tripId, amount});
    return response.data
}