import React from "react";
import TruckImage from "../../assets/Road-Freight-blog.jpg";
import { useNavigate } from "react-router-dom";


interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SelectRolePage: React.FC<RoleModalProps> = ({ isOpen, onClose }) => {

  const navigate = useNavigate()

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
      <div className="bg-zinc-800 bg-opacity-90 p-8 rounded-2xl shadow-lg flex w-full max-w-4xl items-center relative">        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-lg font-bold "
        >
          ✖
        </button>
        <div className="w-1/2">
          <img
            src={TruckImage}
            alt="Truck"
            className="rounded-xl object-cover w-full h-full"
          />
        </div>
        <div className="w-1/2 p-6 text-center">
          <h1 className="text-white text-3xl font-semibold mb-6">Start Your Journey</h1>

          <div className="space-y-4">
            <button onClick={() => navigate('/login/transporter')} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-lg">
              🚛 Transporter
            </button>
            <button onClick={() => navigate("/login/shipper")} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-lg">
              📦  Shipper
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SelectRolePage;
