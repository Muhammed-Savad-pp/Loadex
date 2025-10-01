import React, { useState, useRef, useEffect } from "react";
import Truck from "../../../assets/truck-logistics-operations-dusk (2).jpg";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../redux/slice/authSlice";
import { transporterLoginRequest, transporterResendOtp, transporterForgotPasswordEmailSubmit, transporterOtpVerify, tranpsorterNewPasswordSet } from "../../../services/transporter/transporterApi";
import toast from "react-hot-toast";
import { shipperLoginRequest, shipperResendOtp, shipperForgotPasswordEmailSubmit, shipperOtpVerify, shipperNewPasswordSet } from "../../../services/shipper/shipperService";
import { Eye, EyeOff, Lock, X } from 'lucide-react';
import Google from "../../../components/Common/Google";



const SignUp = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false)
  const [forgotEmailModal, setForgotEmailModal] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(120);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState<boolean>(false)
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});


  const otpInputRef = useRef<(HTMLInputElement | null)[]>([]);


  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  const role = location.pathname.includes("transporter") ? "transporter" : "shipper";

  useEffect(() => {
    setTimer(134)

    const countDown = setInterval(() => {
      setTimer((prev) => {
        if (prev < 1) {
          clearInterval(countDown);
          setResendDisabled(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000)

    return () => clearInterval(countDown);
  }, [])

  const onClose = () => {
    setShowNewPasswordModal(false);
    setPassword('');
    setConfirmPassword('');
  };

  const validatePassword = (password: string, confirmPassword: string): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (!/\d/.test(password)) {
      errors.password = "Password must contain at least one number";
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.password = "Password must contain at least one letter";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true)

    try {

      if (role === 'transporter') {

        const response: any = await transporterLoginRequest(email, password)

        if (response.success) {

          toast.success(response.message)

          dispatch(loginSuccess({ token: response.accessToken, role: response.role }))

          navigate('/')

        }
      } else {

        const response = await shipperLoginRequest(email, password);

        if (response.success) {

          toast.success(response.message)

          dispatch(loginSuccess({ token: response.accessToken as string, role: response.role as string }))

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

  const handleSubmitForgotEmail = async () => {
    try {

      if (role === 'transporter') {

        const response: any = await transporterForgotPasswordEmailSubmit(email)

        if (response.success) {

          toast.success(response.message);
          setForgotEmailModal(false)
          setShowOtpModal(true);

        }

      } else {

        const response: any = await shipperForgotPasswordEmailSubmit(email);

        if (response.success) {
          toast.success(response.message);
          setForgotEmailModal(false)
          setShowOtpModal(true);
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleOtpinputChange = (index: number, value: string) => {

    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        otpInputRef.current[index + 1]?.focus();
      }

      if (!value && index > 0) {
        otpInputRef.current[index - 1]?.focus();
      }

    }
  }

  const handleSubmitOtp = async () => {
    try {

      const otpData = otp.join("");

      if (role === 'transporter') {

        const response: any = await transporterOtpVerify(otpData, email)

        if (response.success) {

          toast.success(response.message);
          setShowOtpModal(false)
          setShowNewPasswordModal(true)

        } else {
          toast.error(response.message)
        }
      }
      else {

        const response: any = await shipperOtpVerify(otpData, email);
        if (response.success) {

          toast.success(response.message);
          setShowOtpModal(false)
          setShowNewPasswordModal(true)

        } else {
          toast.error(response.message)
        }

      }

    } catch (error: any) {
      console.log('OTP error', error.response.data.message)
      toast.error(error.response.data.message)
    }
  }

  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validatePassword(password, confirmPassword);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {

      if (role === 'transporter') {

        const response: any = await tranpsorterNewPasswordSet(email, password);

        if (response.success) {
          toast.success(response.message);
          setShowNewPasswordModal(false);
        }

      } else {

        const response: any = await shipperNewPasswordSet(email, password);

        toast.success(response.message);
        setShowNewPasswordModal(false);

      }

    } catch (error) {
      console.log(error)
    }

  }

  const navigateToRegister = () => {
    navigate(role == "transporter" ? "/register/transporter" : "/register/shipper")
  }

  const handleResendOtp = async () => {

    try {

      if (role == 'transporter') {

        const response: any = await transporterResendOtp(email);

        if (response.success) {
          toast.success(response.message);
        }
      } else {

        const response = await shipperResendOtp(email)

        if (response.success) {
          toast.success(response.message)
        }

      }

    } catch (error) {
      console.log(error);

    }

  }


  return (
    <>

      <div className="min-h-screen flex items-center justify-center bg-black px-4">

        <div className="bg-zinc-900 p-0 rounded-2xl shadow-lg flex w-full max-w-4xl overflow-hidden">
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

            {/* <button className="w-full py-3 bg-white rounded-lg mt-5 font-bold flex items-center justify-center space-x-2">
              <FcGoogle className="text-xl" />
              <span>Sign up with Google</span>
            </button> */}

            <div className="ml-8 w-50 flex justify-center">
              <Google />
            </div>

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
              <p onClick={() => setForgotEmailModal(true)} className="text-white ml-auto ">
                ForgotPassword
              </p>
            </div>

            <p className=" mt-5 text-white">
              Dont have an account?
              <span onClick={navigateToRegister} className="text-blue-700 cursor-pointer"> SignUp</span>
            </p>
          </div>
        </div>
      </div>



      {forgotEmailModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black opacity-75"></div>
            </div>

            {/* Modal positioning */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal content */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Forgot Password
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Please enter your email address. We will send you a Otp.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-10 py-2 sm:text-sm border border-gray-300 rounded-md"
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmitForgotEmail}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Send OTP
                </button>
                <button
                  type="button"
                  onClick={() => setForgotEmailModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showOtpModal && (
        <div className="fixed inset-0 flex   items-center justify-center z-40">
          <div className="bg-zinc-800 p-6 rounded-2xl shadow-lg text-center w-96">
            <h2 className="text-white text-2xl font-bold">OTP Verification</h2>
            <p className="text-gray-400 mt-2">
              Enter the OTP you received at <span className="text-purple-400">{email}</span>
            </p>
            <div className="flex justify-center gap-2 my-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRef.current[index] = el)}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpinputChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                      otpInputRef.current[index - 1]?.focus();
                    }
                  }}
                  className="w-12 h-12 text-center text-xl bg-transparent border border-purple-500 text-white rounded-lg focus:outline-none focus:border-purple-400"
                />
              ))}
            </div>
            <button
              onClick={handleSubmitOtp}
              className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-lg font-semibold hover:opacity-90 transition">
              Verify
            </button>

            <p className="text-gray-400 mt-3">
              ({String(Math.floor(timer / 60)).padStart(2, "0")}:
              {String(timer % 60).padStart(2, "0")})
            </p>

            <p className="text-gray-400 mt-2">
              Didn’t receive the code?{" "}
              <button
                onClick={handleResendOtp}
                disabled={resendDisabled}
                className={`${resendDisabled ? "text-gray-500 cursor-not-allowed" : "text-purple-400 hover:underline"
                  }`}
              >
                Resend Code
              </button>
            </p>
          </div>
        </div>
      )}


      {showNewPasswordModal && (
        <div className="fixed inset-0 bg-black opacity-95 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            {/* Header */}
            <div className="bg-blue-600 p-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white flex items-center">
                <Lock className="mr-2" size={20} />
                Create New Password
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmitNewPassword} className="p-6">
              <div className="space-y-4">
                {/* Password input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <div className="text-red-500 text-sm mt-2">
                    {errors.password}
                  </div>
                )}

                {/* Confirm Password input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
              {errors.confirmPassword && (
                <div className="text-red-500 text-sm mt-2">
                  {errors.confirmPassword}
                </div>
              )}

              {/* Footer with buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default SignUp;
