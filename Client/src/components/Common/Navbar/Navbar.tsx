// import "./Navbar.css";
// import { Link, useNavigate } from "react-router-dom";
// import { FaBell } from "react-icons/fa";
// import React, { useState, } from "react";
// import { useSelector } from "react-redux";
// import { FaUserAlt } from "react-icons/fa";
// import { getTransporterVerificationStatus } from "../../../services/transporter/transporterApi";
// import { getShipperVerificatinStatus } from "../../../services/shipper/shipperService";
// import toast from "react-hot-toast";

// interface NavbarProps {
//   onLoginClick?: () => void;
// }

// const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {

//   const [isDropdownOpen, setIsDropdownOpen] = useState(false)

//   const navigate = useNavigate()

//   const { isLoggedIn, role } = useSelector((state: any) => state.auth)


//   const handleRegisterTruck = async () => {
//     try {

//       const response: any = await getTransporterVerificationStatus();

//       if(response.success) {

//         if(response.verificationStatus == 'approved') {

//           navigate('/transporter/registerTruck');

//         } else if( response.verificationStatus == 'pending' ) {

//           toast.error('Verification pending. Complete your profile.');
//           navigate('/transporter/profile');

//         } else if( response.verificationStatus == 'requested') {

//           toast.error('Awaiting admin approval.');

//         } else {

//           toast.error('Verification incomplete.');
//           navigate('/transporter/profile');

//         }
//       }
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   const handlePostLoad = async () => {
//     try {

//       const response: any = await getShipperVerificatinStatus();
//       console.log(response);

//       if(response.success) {

//         if(response.shipperData == 'approved') {

//           navigate('/shipper/postLoad');

//         } else if( response.shipperData == 'requested') {

//           toast.error('Awaiting admin approval.');

//         } else {

//           toast.error('Verification incomplete.');
//           navigate('/shipper/profile');

//         }
//       }

//     } catch (error) {
//       console.log(error)
//     }
//   }

//   const handleProfileClick = () => {

//     if(isLoggedIn && role === 'transporter'){
//       navigate('/transporter/profile')
//     } else if(isLoggedIn && role === 'shipper') {
//       navigate('/shipper/profile')
//     }
//   }

//   return (
//     <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#E31937] to-[#FF9F1C]">
//       <nav className=" text-white px-4 py-2">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <Link to="/" className="text-3xl  logo-text">
//             Loadex
//           </Link>
//           <div className="flex items-center gap-6">
//             <Link to="/" className="hover:opacity-80 text-xl">Home</Link>
//             {
//               role === 'transporter' ? 
//                 <Link to="/transporter/loadBoard" className="hover:opacity-80 text-xl">Board</Link>
//               : 
//                 <Link to="/shipper/truckBoard" className="hover:opacity-80 text-xl">Board</Link>
//             }

//             <div className="relative" onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
//               <button className="hover:opacity-80 text-xl">
//                 Service
//               </button>
//               {isDropdownOpen && (
//                 <div className="absolute top-full left-0 bg-black/80 text-white rounded-lg shadow-lg w-40 z-50">
//                   {
//                     role === 'transporter' ?
//                       <ul className="py-2">
//                         <li className="px-4 py-2 hover:bg-gray-100 hover:text-black cursor-pointer">Post Truck</li>
//                         <li onClick={handleRegisterTruck} className="px-4 py-2 hover:bg-gray-100 hover:text-black cursor-pointer">Register Truck</li>
//                       </ul>
//                       :
//                       <ul className="py-2">
//                         <li onClick={handlePostLoad}  className="px-4 py-2 hover:bg-gray-200 hover:text-black cursor-pointer">Post Load </li>
//                       </ul>
//                   }
//                 </div>
//               )}
//             </div>
//             {
//               role === 'transporter' ? 
//                 <Link to="/transporter/directory" className="hover:opacity-80 text-xl">Directory</Link> : 
//                 <Link to="/shipper/directory" className="hover:opacity-80 text-xl">Directory</Link>
//             } 
//           </div>
//           <div className="flex items-center gap-4">
//             {isLoggedIn ? (
//               <button onClick={handleProfileClick}><FaUserAlt size={20} /></button>
//             ) : (
//               <button onClick={onLoginClick} className="hover:opacity-80">Login</button>
//             )}

//             <FaBell size={20} className="cursor-pointer" />
//           </div>

//         </div>
//       </nav>

//     </div>


//   );
// }

// export default Navbar;

import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaUserAlt, FaBars, FaTimes } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { findTransporterUnreadNotificationCount, getTransporterVerificationStatus } from "../../../services/transporter/transporterApi";
import { findShipperUnReadNotificationCount, getShipperVerificatinStatus } from "../../../services/shipper/shipperService";
import toast from "react-hot-toast";
import { MessageSquareText } from 'lucide-react';
import TransporterNotification from "../../../pages/Transporter/TransporterNotification";
import ShipperNotification from "../../../pages/shipper/ShipperNotification";

interface NavbarProps {
  onLoginClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [transporterNotificationModalOpen, setTransporterNotificationModalOpen] = useState<boolean>(false);
  const [shipperNotificationModalOpen, setShipperNotificationModalOpen] = useState<boolean>(false);
  const [unReadNotificationCount, setUnReadNotificationCount] = useState<number>(0)
  const navigate = useNavigate();
  const { isLoggedIn, role } = useSelector((state: any) => state.auth);

  useEffect(() => {

    const getUnreadNotificationCount = async () => {
      if(isLoggedIn && role === 'transporter') {
        const count = await findTransporterUnreadNotificationCount();
        setUnReadNotificationCount(count as number);
      } else if(isLoggedIn && role === 'shipper') {
        console.log('asdasdf');
        
        const count = await findShipperUnReadNotificationCount();
        console.log(count);
        
        setUnReadNotificationCount(count as number);
      }
    }

    getUnreadNotificationCount();
  }, [])

  
  

  const handleRegisterTruck = async () => {
    try {
      const response: any = await getTransporterVerificationStatus();

      if (response.success) {
        if (response.verificationStatus == "approved") {
          navigate("/transporter/registerTruck");
        } else if (response.verificationStatus == "pending") {
          toast.error("Verification pending. Complete your profile.");
          navigate("/transporter/profile");
        } else if (response.verificationStatus == "requested") {
          toast.error("Awaiting admin approval.");
        } else {
          toast.error("Verification incomplete.");
          navigate("/transporter/profile");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePostLoad = async () => {
    try {
      const response: any = await getShipperVerificatinStatus();
      console.log(response);

      if (response.success) {
        if (response.shipperData == "approved") {
          navigate("/shipper/postLoad");
        } else if (response.shipperData == "requested") {
          toast.error("Awaiting admin approval.");
        } else {
          toast.error("Verification incomplete.");
          navigate("/shipper/profile");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleProfileClick = () => {
    if (isLoggedIn && role === "transporter") {
      navigate("/transporter/profile");
    } else if (isLoggedIn && role === "shipper") {
      navigate("/shipper/profile");
    }
  };

  const handleChatClick = () => {
    if (isLoggedIn && role === 'transporter') {
      navigate('/transporter/chat')
    } else if (isLoggedIn && role === 'shipper') {
      navigate('/shipper/chat')
    }
  }

  const handleNotification = () => {
    if (isLoggedIn && role === 'transporter') {
      setTransporterNotificationModalOpen(!transporterNotificationModalOpen)
    } else if (isLoggedIn && role === 'shipper') {
      setShipperNotificationModalOpen(!shipperNotificationModalOpen)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 navbar-container">
      <nav className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo - always visible */}
          <Link to="/" className="text-3xl logo-text">
            Loadex
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 desktop-menu">
            <Link to="/" className="nav-link text-lg">
              Home
            </Link>

            {role === "transporter" ? (
              <Link to="/transporter/loadBoard" className="nav-link text-lg">
                Board
              </Link>
            ) : (
              <Link to="/shipper/truckBoard" className="nav-link text-lg">
                Board
              </Link>
            )}

            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="nav-link text-lg flex items-center">
                Service
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0  dropdown-menu w-48 py-1">
                  {role === "transporter" ? (
                    <ul>
                     
                      <li
                        onClick={handleRegisterTruck}
                        className="dropdown-item px-4 py-2 cursor-pointer"
                      >
                        Register Truck
                      </li>
                    </ul>
                  ) : (
                    <ul>
                      <li
                        onClick={handlePostLoad}
                        className="dropdown-item px-4 py-2 cursor-pointer"
                      >
                        Post Load
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>

            {role === "transporter" ? (
              <Link to="/transporter/directory" className="nav-link text-lg">
                Directory
              </Link>
            ) : (
              <Link to="/shipper/directory" className="nav-link text-lg">
                Directory
              </Link>
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button
                onClick={handleProfileClick}
                className="nav-button p-2 rounded-md"
              >
                <FaUserAlt size={18} />
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="login-button px-4 py-2 rounded-md"
              >
                Login
              </button>
            )}

            <button className="nav-button p-2 rounded-md" onClick={handleChatClick}>
              <MessageSquareText size={18} />
            </button>

            <button className="nav-button p-2 rounded-md relative" onClick={handleNotification}>
              <FaBell size={18} />
              {unReadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-4 flex items-center justify-center min-w-[20px]">
                  {unReadNotificationCount > 99 ? '99+' : unReadNotificationCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle button */}
            <button
              className="mobile-menu-button p-2 nav-button rounded-md ml-2"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>


        {transporterNotificationModalOpen && (
          <TransporterNotification />
        )}

        {shipperNotificationModalOpen && (
          <ShipperNotification />
        )}


        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mobile-menu">
            <div className="mobile-menu-item">
              <Link to="/" className="nav-link block">
                Home
              </Link>
            </div>

            <div className="mobile-menu-item">
              {role === "transporter" ? (
                <Link to="/transporter/loadBoard" className="nav-link block">
                  Board
                </Link>
              ) : (
                <Link to="/shipper/truckBoard" className="nav-link block">
                  Board
                </Link>
              )}
            </div>

            <div className="mobile-menu-item">
              <div className="nav-link">Service</div>
              <div className="pl-4 mt-2">
                {role === "transporter" ? (
                  <div>
                    <div className="py-2 text-white">Post Truck</div>
                    <div
                      onClick={handleRegisterTruck}
                      className="py-2 text-white cursor-pointer"
                    >
                      Register Truck
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={handlePostLoad}
                    className="py-2 text-white cursor-pointer"
                  >
                    Post Load
                  </div>
                )}
              </div>
            </div>

            <div className="mobile-menu-item">
              {role === "transporter" ? (
                <Link to="/transporter/directory" className="nav-link block">
                  Directory
                </Link>
              ) : (
                <Link to="/shipper/directory" className="nav-link block">
                  Directory
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};


export default Navbar;
