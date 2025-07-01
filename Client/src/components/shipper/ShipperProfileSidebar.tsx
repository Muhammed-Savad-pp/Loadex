import { useDispatch } from "react-redux";
import { logOut } from "../../redux/slice/authSlice"; 
import { shipperLogout } from "../../services/shipper/shipperService";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getShipperProfile } from "../../services/shipper/shipperService";
import { Crown } from 'lucide-react';

interface IShipper {
  _id: string;
  shipperName: string;
  profileImage: string;
  followers: string[];
  followings: string[];
  subscription: {
    status: string;
    isActive: boolean;
  }
}


const ShipperProfileSidebar = () => {

  const [shipper, setShipper] = useState<IShipper>()  

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchShipper = async() => {
      const response: any = await getShipperProfile();
      if(response.success) {
        setShipper(response.shipperData)
      }
    }

    fetchShipper()
  }, [])


  const handleLogout = async () => {
    try {

        const response = await shipperLogout();
        toast.success(response.message)
        dispatch(logOut());

        
    } catch (error) {
        console.log(error)
    }
  }

  const handleNavigate = (item : string) => {
    navigate(item)
  }

  return (
    <div className="w-75 bg-zinc-900 text-white min-h-screen p-4">
      <div className="bg-zinc-800 rounded-lg p-4 mb-4 mt-5 text-center">
        <div className="flex justify-center">
          <img
            src={shipper?.profileImage}
            alt="Profile"
            className="w-16 h-16 rounded-full bg-sky-200 mx-auto"
          />
        </div>
        <div className="flex gap-0.5 justify-center">
          <h2 className="text-lg font-bold mt-2">{shipper?.shipperName}</h2>
          { shipper?.subscription.isActive && shipper.subscription.status === 'active' && (
            <Crown className="text-yellow-500 mt-3 w-7 h-5"/>
          )}
        </div>
        <p className="text-xs text-gray-400">Shipper</p>
        <div className="flex justify-center text-xs mt-1 text-gray-400">
          <span>{shipper?.followers.length} Followers</span>
          <span className="mx-1">•</span>
          <span>{shipper?.followings.length} Following</span>
        </div>
      </div>

      {/* Menu Options */}
      <div className="grid grid-cols-1 gap-2">
        {[
          {label: "My Loads", path: "/shipper/myLoads" }, 
          {label: "Trips", path: "/shipper/trips"},
          // {label:"My Network", path:"/shipper/myNetwork"}, 
          {label: "Subscription", path: "/shipper/subscription"}, 
          {label:"Payment History", path: "/shipper/paymentHistory"}, 
          {label:"My Bids", path:"/shipper/bids"}].
          map((item, index) => (
          <button key={index} onClick={() => handleNavigate(item.path)} className={`w-full text-center rounded-lg p-3 ${location.pathname == item.path ? "bg-blue-600" : "bg-zinc-800"} `}>
            {item.label}
          </button>
        ))}
      </div>

      <button  className="w-full mt-4 bg-white text-red-500 py-2 rounded-md flex items-center justify-center gap-2" onClick={handleLogout} >
        Log Out
      </button>
    </div>
  );
};

export default ShipperProfileSidebar;
