import { axiosInstance } from "../axiosInstance/axiosInstance";

const api = axiosInstance;

export const sendBid = async (formData: FormData) => {
    const response = await api.post('/bid/bid', formData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const fetchBidsForTransporter = async (page: number, limit: number, status: string) => {
    const response = await api.get(`/bid/transporter-bid?page=${page}&limit=${limit}&status=${status}`);
    return response.data;
}

export const updateBid = async (bidId: string, truckId: string, price: string) => {
    const response = await api.put(`/bid/bid/${bidId}`, {truckId, price })
    return response.data;    
}

export const deleteBid = async (bidId: string) => {
    const response = await api.delete(`/bid/bid/${bidId}`);
    return response.data;
}

export const fetchBidsForShipper = async (page: number, limit: number, status: string) => {
    const response = await api.get(`/bid/shipper-bid?page=${page}&limit=${limit}&status=${status}`);
    return response.data;
}

export const updateBidStatusByShipper = async (bidId: string, status: string) => {
    const response = await api.patch(`/bid/bid/${bidId}`, {bidId, status})
    return response.data;

}