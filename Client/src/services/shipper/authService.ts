import { userSignUp } from "../../interface/interface";
import { axiosInstance } from "../axiosInstance/axiosInstance";

const api = axiosInstance;

interface IResponse {
    success: boolean;
    message: message;
    data?: any;
}

interface message {
    message: string
}

export const shipperSignup = async (userData: userSignUp) : Promise<IResponse> =>  {

    const response = await api.post<IResponse>('/shipper/register', userData);
    return response.data

}