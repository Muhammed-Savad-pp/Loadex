import React from "react";
import { transporterLogout } from "../../services/transporter/transporterApi";
import { useDispatch } from "react-redux";
import { logOut } from "../../redux/slice/authSlice"; 
import { useNavigate, useLocation } from "react-router-dom";

const ProfileSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Get current route path

  const handleLogout = async () => {
    try {
      await transporterLogout();
      dispatch(logOut());
    } catch (error) {
      console.error(error);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-75 bg-zinc-900 text-white min-h-screen p-4">
      {/* Profile Card */}
      <div className="bg-zinc-800 rounded-lg p-4 mb-4 mt-5 text-center">
        <div className="flex justify-center">
          <img
            src="/api/placeholder/70/70"
            alt="Profile"
            className="w-16 h-16 rounded-full bg-sky-200 mx-auto"
          />
        </div>
        <h2 className="text-lg font-bold mt-2">Jacobs</h2>
        <p className="text-xs text-gray-400">Transport Contractor • Peninsular</p>
        <div className="flex justify-center text-xs mt-1 text-gray-400">
          <span>5 Followers</span>
          <span className="mx-1">•</span>
          <span>4 Following</span>
        </div>
      </div>

      {/* Menu Options */}
      <div className="grid grid-cols-1 gap-2">
        {[
          { label: "My Trucks", path: "/transporter/myTrucks" },
          { label: "Trip History", path: "/transporter/trips" },
          { label: "My Network", path: "/transporter/myNetwork" },
          { label: "Membership", path: "/transporter/membership" },
          { label: "Payment History", path: "/transporter/paymentHistory" },
          { label: "My Bids", path: "/transporter/myBids" }
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavigate(item.path)}
            className={`w-full rounded-lg p-3 text-center ${
              location.pathname === item.path ? "bg-blue-600" : "bg-zinc-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <button 
        className="w-full mt-4 bg-white text-red-500 py-2 rounded-md flex items-center justify-center gap-2" 
        onClick={handleLogout}
      >
        Log Out
      </button>
    </div>
  );
};

export default ProfileSidebar;
