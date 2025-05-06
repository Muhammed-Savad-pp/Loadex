import { useDispatch } from "react-redux";
import { logOut } from "../../redux/slice/authSlice"; 
import { shipperLogout } from "../../services/shipper/shipperService";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";


const ShipperProfileSidebar = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();


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
        <p className="text-xs text-gray-400">Shipper</p>
        <div className="flex justify-center text-xs mt-1 text-gray-400">
          <span>5 Followers</span>
          <span className="mx-1">•</span>
          <span>4 Following</span>
        </div>
      </div>

      {/* Menu Options */}
      <div className="grid grid-cols-1 gap-2">
        {[
          {label: "My Loads", path: "/shipper/myLoads" }, 
          {label:"Load History", path: "/shipper/loadHistory"}, 
          {label: "Trips", path: "/shipper/trips"},
          {label:"My Network", path:"/shipper/myNetwork"}, 
          {label: "Membership", path: "/shipper/memberShip"}, 
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
