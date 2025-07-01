import { useEffect, useState } from "react";
import { getTransporterProfile, transporterLogout } from "../../services/transporter/transporterApi";
import { useDispatch } from "react-redux";
import { logOut } from "../../redux/slice/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { Crown } from 'lucide-react';

interface ITransporter {
  _id: string;
  transporterName: string;
  profileImage: string;
  followers: string[];
  followings: string[];
  subscription: {
    status: string;
    isActive: boolean
  }
}

const ProfileSidebar = () => {

  const [transporter, setTransporter] = useState<ITransporter>();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchTransporter = async () => {
      const response: any = await getTransporterProfile();
      if (response.success) {
        setTransporter(response.transporterData)
      }
    }
    fetchTransporter()
  }, [])

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
            src={transporter?.profileImage}
            alt="Profile"
            className="w-16 h-16 rounded-full bg-sky-200 mx-auto"
          />
        </div>
        <div className="flex justify-center ">
          <h2 className="text-lg font-bold mt-2">{transporter?.transporterName}</h2>
          { transporter?.subscription.isActive && transporter.subscription.status === 'active' && (
            <Crown className=" text-yellow-500 mt-3 w-7 h-5" />
          )}
        </div>
        <p className="text-xs text-gray-400">Transport Contractor</p>
        <div className="flex justify-center text-xs mt-1 text-gray-400">
          <span>{transporter?.followers.length} Followers</span>
          <span className="mx-1">•</span>
          <span>{transporter?.followings.length} Following</span>
        </div>
      </div>

      {/* Menu Options */}
      <div className="grid grid-cols-1 gap-2">
        {[
          { label: "My Trucks", path: "/transporter/myTrucks" },
          { label: "Trip History", path: "/transporter/trips" },
          { label: "My Network", path: "/transporter/network" },
          { label: "Subscription", path: "/transporter/subscription" },
          { label: "Payment History", path: "/transporter/paymentHistory" },
          { label: "My Bids", path: "/transporter/myBids" },
          { label: 'Wallet', path: '/transporter/wallet'}
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavigate(item.path)}
            className={`w-full rounded-lg p-3 text-center ${location.pathname === item.path ? "bg-blue-600" : "bg-zinc-800"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

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
