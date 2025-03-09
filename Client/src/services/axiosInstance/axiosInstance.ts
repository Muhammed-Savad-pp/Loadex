import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import store from "../../redux/store";
const API_URL = import.meta.env.VITE_API_BASE_URL;
import { loginSuccess, logOut } from "../../redux/slice/authSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

 const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// Correctly type the request interceptor
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const state = store.getState();
        const token = state.auth.token;

        if (token) {
            config.headers = config.headers || {}; // Ensure headers exist
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        console.error("Request Error", error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {_retry?: boolean};
        if(originalRequest && error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                
                const state = store.getState();
                const role = state.auth.role;
                const response = await axios.post<{token: string, role: string}>(`${API_URL}/${role}/auth/refresh-token`,
                    {},
                    {withCredentials: true}
                );

                if(response.status === 200) {
                    console.log(response, ': response');
                    store.dispatch(loginSuccess({token: response.data.token, role: response.data.role}));
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
                    return axiosInstance(originalRequest)
                    
                }
            } catch (error) {
                console.error("Refresh Token Error", error);
                store.dispatch(logOut())
                return Promise.reject(error)
            }
        }

        return Promise.reject(error)
    }
)

const publicApiClinet = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})

export  {axiosInstance, publicApiClinet};
