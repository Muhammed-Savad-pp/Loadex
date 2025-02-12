import { userSignUp } from "../interface/interface";
import { axiosInstance } from "./axiosInstance/axiosInstance";

const api = axiosInstance

export const signUp = async(userData:userSignUp, userType:string) => {
    try {
        console.log(userData.name,"asdfdsf")
        console.log(userType)
        const response = await api.post(`/transporter/register`, userData)
    } catch (error) {
        console.log("error", error);
        
    }
}