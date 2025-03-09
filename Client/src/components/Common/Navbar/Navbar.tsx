import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import React, { useState, } from "react";
import { useSelector } from "react-redux";
import { FaUserAlt } from "react-icons/fa";
import { getTransporterVerificationStatus } from "../../../services/transporter/transporterApi";
import toast from "react-hot-toast";

interface NavbarProps {
  onLoginClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const navigate = useNavigate()

  const { isLoggedIn, role } = useSelector((state: any) => state.auth)


  const handleRegisterTruck = async () => {
    try {

      console.log('erre');

      const response: any = await getTransporterVerificationStatus();

      if(response.success) {

        if(response.verificationStatus == 'approved') {

          navigate('/transporter/registerTruck');

        } else if( response.verificationStatus == 'pending' ) {

          toast.error('Verification pending. Complete your profile.');
          navigate('/transporter/profile');

        } else if( response.verificationStatus == 'requested') {

          toast.error('Awaiting admin approval.');

        } else {

          toast.error('Verification incomplete.');
          navigate('/transporter/profile');

        }
      }

    } catch (error) {
      console.log(error)
    }
  }

  const handleProfileClick = () => {
    
    if(isLoggedIn && role === 'transporter'){
      navigate('/transporter/profile')
    } else if(isLoggedIn && role === 'shipper') {
      navigate('/shipper/profile')
    }

  }



  return (
    <div className="bg-gradient-to-r from-[#E31937] to-[#FF9F1C]">
      <nav className=" text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-3xl  logo-text">
            Loadex
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:opacity-80 text-xl">Home</Link>
            <Link to="/board" className="hover:opacity-80 text-xl">Board</Link>
            {/* {
              role === 'transporter' ? 
              // <button onClick={handlePostTruck} className="hover:opacity-80 text-xl">Post Truck</button> 
              : <button  className="hover:opacity-80 text-xl">Post Load</button>
            }
             */}
            <div className="relative" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
              <button className="hover:opacity-80 text-xl">
                Service
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 bg-black/80 text-white rounded-lg shadow-lg w-40 z-50">
                  {
                    role === 'transporter' ?
                      <ul className="py-2">
                        <li className="px-4 py-2 hover:bg-gray-100 hover:text-black cursor-pointer">Post Truck</li>
                        <li onClick={handleRegisterTruck} className="px-4 py-2 hover:bg-gray-100 hover:text-black cursor-pointer">Register Truck</li>
                      </ul>
                      :
                      <ul className="py-2">
                        <li  className="px-4 py-2 hover:bg-gray-200 cursor-pointer">Post Load </li>
                      </ul>
                  }
                </div>
              )}
            </div>





            <Link to="/directory" className="hover:opacity-80 text-xl">Directory</Link>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button onClick={handleProfileClick}><FaUserAlt size={20} /></button>
            ) : (
              <button onClick={onLoginClick} className="hover:opacity-80">Login</button>
            )}

            <FaBell size={20} className="cursor-pointer" />
          </div>

        </div>
      </nav>

    </div>


  );
}

export default Navbar;
