import { useLocation, useNavigate } from "react-router-dom";
import truckImage from "../../../assets/2d21e558-ebd0-4a8f-9f25-b214ae94c82f.jpg"
import React, { useState } from "react";
import { formError, userSignUp } from "../../../interface/interface";
import { validateForm } from "../../../validations/authValidation";
import { signUp } from "../../../services/authService";



const RegisterPage: React.FC = () => {

  const [formData , setFormData] = useState<userSignUp>({
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



  const location = useLocation();
  const navigate = useNavigate();

  let role = location.pathname.includes("transporter" ) ? "transporter" : "shipper";

  const navigateToLogin = () => {
    navigate(role === "transporter" ? "/transporter/login" : "/shipper/login")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData({ ...formData, [name]:value.trim() })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {isValid, errors} = validateForm(formData, "register")

    setFormError(errors)

    if(isValid){
      try {
        const response = await signUp(formData, role)
      } catch (error) {
        
      }
    }
    console.log(formError)

  }

  console.log(formData)
  
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 px-4">
      <div className="bg-zinc-800 rounded-2xl shadow-lg flex w-full max-w-4xl p-8">
        
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

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your name" className="w-full p-3 bg-zinc-700 text-white rounded-lg focus:outline-none" />
            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" className="w-full p-3 bg-zinc-700 text-white rounded-lg focus:outline-none" />
            <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter your number" className="w-full p-3 bg-zinc-700 text-white rounded-lg focus:outline-none" />
            <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter your password" className="w-full p-3 bg-zinc-700 text-white rounded-lg focus:outline-none" />
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Re-enter your password" className="w-full p-3 bg-zinc-700 text-white rounded-lg focus:outline-none" />

            <div className="flex items-center space-x-2 text-white">
              <input type="checkbox" required />
              <span>
                I agree to the <a href="/terms" className="text-blue-400 hover:underline">Terms & Conditions</a>
              </span>
            </div>

            <button type="submit" className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-lg">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
