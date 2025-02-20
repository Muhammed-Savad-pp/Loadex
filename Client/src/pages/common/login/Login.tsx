import React, { useState } from "react";
import Truck from "../../../assets/truck-logistics-operations-dusk (2).jpg";
import { FcGoogle } from "react-icons/fc";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../redux/slice/authSlice";
import { transporterLoginRequest } from "../../../services/transporter/authService";
import toast from "react-hot-toast";
import { shipperLoginRequest } from "../../../services/shipper/authService";


const SignUp = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  let role = location.pathname.includes("transporter") ? "transporter" : "shipper";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true)

    try {

      if (role === 'transporter') {

        const response = await transporterLoginRequest(email, password)
        console.log('accessToken', response.accessToken);

        if (response.success) {

          toast.success(response.message)

          dispatch(loginSuccess({ token: response.accessToken, role: response.role }))

          navigate('/')

        }
      } else {
        
        const response = await shipperLoginRequest(email, password);

        if(response.success) {
          
          toast.success(response.message)

          dispatch(loginSuccess({token: response.accessToken, role: response.role}))

          navigate('/')
        }
      }

    } catch (error: any) {

      const errorMessage = error.response?.data?.message || 'somthing went wrong'
      toast.error(errorMessage)


    } finally {
      setIsLoading(false)
    }

  };

  const navigateToRegister = () => {
    navigate(role == "transporter" ? "/transporter/register" : "/shipper/register")
  }

  return (
    <>

      <div className="min-h-screen flex items-center justify-center bg-black px-4">

        <div className="bg-zinc-900 p-0 rounded-2xl shadow-lg flex w-full max-w-4xl overflow-hidden">
          {/* Left - Image Section */}
          <div className="flex-1">
            <img
              src={Truck}
              alt="Truck"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Right - Form Section */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            <h3 className="text-white text-3xl  mb-2" style={{ fontFamily: "Irish Grover, cursive" }}>
              Loadex
            </h3>
            <p className="text-white text-lg font-semibold mb-4">
              Login for {role === "transporter" ? "Transporter" : "Shipper"}
            </p>

            <button className="w-full py-3 bg-white rounded-lg mt-5 font-bold flex items-center justify-center space-x-2">
              <FcGoogle className="text-xl" />
              <span>Sign up with Google</span>
            </button>

            <p className="mt-2 text-center text-white font-semibold">OR</p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />


              {/* Button */}
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                {isLoading ? "loading" : "Login"}
              </button>
            </form>
            <div className="flex mt-2">
              <p className="text-white ml-auto ">
                ForgotPassword
              </p>
            </div>

            <p className=" mt-5 text-white">
              Don't have an account?
              <span onClick={navigateToRegister} className="text-blue-700 cursor-pointer"> SignUp</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
