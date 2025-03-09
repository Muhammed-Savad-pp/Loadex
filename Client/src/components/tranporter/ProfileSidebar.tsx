import React from "react";
import { transporterLogout } from "../../services/transporter/transporterApi";
import { useDispatch } from "react-redux";
import { logOut } from "../../redux/slice/authSlice"; 

const ProfileSidebar = () => {

  const dispatch = useDispatch()

  const handleLogout = async () => {
    try {
      
      const response = await transporterLogout()

      dispatch(logOut())

    } catch (error) {
      console.error(error);
    }
  }


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
        {["My Trucks", "Trip History", "My Network", "Membership", "Payment History", "My Bids"].map((item, index) => (
          <button key={index} className="w-full bg-zinc-800 rounded-lg p-3 text-center">
            {item}
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <button className="w-full mt-4 bg-white text-red-500 py-2 rounded-md flex items-center justify-center gap-2" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};

export default ProfileSidebar;
