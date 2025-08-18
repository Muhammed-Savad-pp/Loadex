import { io } from 'socket.io-client';
const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;


const socket  = io(API_BASE_URL);
export default socket   