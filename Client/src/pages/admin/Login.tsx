import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import TruckImage from '../../assets/a-truck-is-driving-down-a-road-with-a-world-map-behind-it-the-image-is-dark-but-the-headlights-of-the-semi-truck-can-be-seen-a-world-map-with-lines-and-dots-in-the-background-generative-ai-photo.jpeg';
import { adminLogin } from "../../services/admin/adminapi";
import { loginSuccess } from "../../redux/slice/authSlice";
import { useDispatch } from "react-redux";
import {  useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// interface FormData {
//     email: string,
//     password: string
// }

const LoginPage: React.FC = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')

    console.log(email);
    console.log(password);

    const handleLogin =  async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            
            console.log('here')
            const response: any = await adminLogin(email, password);

            if(response.success) {

                console.log('success');
                
                toast.success(response.message)
                dispatch(loginSuccess({token: response.token, role: response.role}))
                navigate('/admin/dashboard')
            } else {
                toast.error(response.message)
            }

        } catch (error) {
            console.log(error)
        }

    }
    
    

    return (
        <>
            <div
                className="min-h-screen bg-gray-900 bg-no-repeat bg-cover flex items-center justify-center"
                style={{ backgroundImage: `url(${TruckImage})` }}
            /* Replace with your own background image */
            >
                <div className="bg-white/90 rounded-lg shadow-lg p-8 w-full max-w-sm">
                    {/* Title */}
                    <h1 className="text-center text-2xl font-semibold mb-6">ADMIN LOGIN</h1>

                    {/* Username Field */}
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">

                            <label className="text-gray-700 font-semibold mb-2 block">
                                Email
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-md px-3 focus-within:border-pink-500 transition-colors">
                                <FaUser className="text-gray-400 mr-2" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="outline-none w-full py-2 bg-transparent focus:ring-0"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="mb-6">
                            <label className="text-gray-700 font-semibold mb-2 block">
                                Password
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-md px-3 focus-within:border-pink-500 transition-colors">
                                <FaLock className="text-gray-400 mr-2" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="outline-none w-full py-2 bg-transparent focus:ring-0"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button type="submit"
                            className="bg-pink-500 w-full py-2 rounded-md text-white hover:bg-pink-600 transition-colors"
                        >
                            LOGIN
                        </button>
                    </form>
                </div>
            </div>
        </>
    )

}

export default LoginPage