import { useLocation, useNavigate } from "react-router-dom";
import truckImage from "../../../assets/2d21e558-ebd0-4a8f-9f25-b214ae94c82f.jpg"
import React, { useEffect, useRef, useState } from "react";
import { formError, userSignUp } from "../../../interface/interface";
import { validateForm } from "../../../validations/authValidation";
import { transporterResendOtp, transporterOtpVerify, transporterSignUp } from "../../../services/transporter/transporterApi";
import toast from "react-hot-toast";
import { shipperOtpVerify, shipperResendOtp, shipperSignup } from "../../../services/shipper/shipperService";



const RegisterPage: React.FC = () => {

  
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(120);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<userSignUp>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [formError, setFormError] = useState<formError>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

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

  const otpInputRef = useRef<(HTMLInputElement | null)[]>([]);

  const location = useLocation();
  const navigate = useNavigate();

  let role = location.pathname.includes("transporter") ? "transporter" : "shipper";

  const navigateToLogin = () => {
    navigate(role === "transporter" ? "/login/transporter" : "/login/shipper")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() })
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


  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    const { isValid, errors } = validateForm(formData, "register")

    setFormError(errors)
    setIsLoading(true)

    if (isValid) {

      try {

        if (role === 'transporter') {

          const response:any = await transporterSignUp(formData)
            
          if (response.success) {
           
            toast.success(response.message)
            setShowOtpModal(true)
            setIsLoading(false)

          }
          
        } else {

          
          const response = await shipperSignup(formData);

          if(response.success){

            toast.success(response.message)
            setShowOtpModal(true);
            setIsLoading(false)
            
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleSubmitOtp = async () => {
    try {

      const email = formData.email;
      const otpData = otp.join("");
      
      if(role === 'transporter'){
        
        const response: any = await transporterOtpVerify(otpData, email)
        
        toast.success(response.message)
        navigate('/login/transporter')

      } else {

        const response = await shipperOtpVerify(otpData, email)
        
          toast.success(response.message);
          navigate('/login/shipper')
      }

    } catch (error: any) {
      console.log('OTP error', error.response.data.message)
       toast.error(error.response.data.message)
    }
  }

  const handleResendOtp = async () => {

    try {

      const email = formData.email;

      if(role == 'transporter'){

        const response: any = await transporterResendOtp(email);

        if(response.success){
          toast.success(response.message);
        }
      } else {

        const response = await shipperResendOtp(email)

        if(response.success) {
          toast.success(response.message)
        }

      }     

    } catch (error) {
      console.log(error);
      
    }

  }



  return (
    <div className={`flex items-center justify-center min-h-screen bg-zinc-900 px-4 `}>
      <div className={`bg-zinc-800 rounded-2xl shadow-lg flex w-full max-w-4xl p-6 relative ${showOtpModal ? "blur-sm" : ""}`}>

        <div className="w-1/2 hidden md:block">
          <img
            src={truckImage}
            alt="Truck"
            className="rounded-xl object-cover w-full h-full"
          />
        </div>

        <div className="w-full md:w-1/2 p-6">
          <h2 className="text-white text-3xl font-bold">Create an account</h2>
          <p className="text-gray-400 text-sm mt-2">
            Already have an account?{" "}
            <span onClick={navigateToLogin} className="text-blue-400 hover:underline">Log in</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-1">
            {/* Name Input */}
            <div className="min-h-[75px]">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className={`w-full p-3 bg-zinc-700 text-white rounded-lg focus:outline-none `}
              />
              {formError.name && (
                <p className="text-red-500 text-xs mt-1">{formError.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="min-h-[75px]">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={`w-full p-3 bg-zinc-700 text-white rounded-lg focus:outline-none `}
              />
              {formError.email && (
                <p className="text-red-500 text-xs mt-1">{formError.email}</p>
              )}
            </div>

            {/* Phone Input */}
            <div className="min-h-[75px]">
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your number"
                className={`w-full p-3 bg-zinc-700 text-white rounded-lg focus:outline-none`}
              />
              {formError.phone && (
                <p className="text-red-500 text-xs mt-1">{formError.phone}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="min-h-[75px]">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`w-full p-3 bg-zinc-700 text-white rounded-lg focus:outline-none `}
              />
              {formError.password && (
                <p className="text-red-500 text-xs mt-1">{formError.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="min-h-[75px]">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                className={`w-full p-3 bg-zinc-700 text-white rounded-lg focus:outline-none `}
              />
              {formError.confirmPassword && (
                <p className="text-red-00 text-xs mt-1">{formError.confirmPassword}</p>
              )}
            </div>

            <button type="submit" className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-lg">
             {isLoading ? 'Please wait' : " Create Account"}
            </button>
          </form>


        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div className="bg-zinc-800 p-6 rounded-2xl shadow-lg text-center w-96">
            <h2 className="text-white text-2xl font-bold">OTP Verification</h2>
            <p className="text-gray-400 mt-2">
              Enter the OTP you received at <span className="text-purple-400">{formData.email}</span>
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
            <button onClick={handleSubmitOtp} className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-lg font-semibold hover:opacity-90 transition">
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

    </div>

  );
};

export default RegisterPage;
