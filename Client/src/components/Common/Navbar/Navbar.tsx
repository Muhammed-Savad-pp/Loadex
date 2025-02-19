import "./Navbar.css";
import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaUserAlt } from "react-icons/fa";

interface NavbarProps {
  onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {


   const { isLoggedIn, role } = useSelector((state: any) => state.auth)
   console.log(isLoggedIn);
   console.log(role);



  return (
    <div className="bg-gradient-to-r from-[#E31937] to-[#FF9F1C]">
      <nav className=" text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-3xl  logo-text">
            Loadex
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:opacity-80">Home</Link>
            <Link to="/board" className="hover:opacity-80">Board</Link>
            <Link to="/services" className="hover:opacity-80">Services</Link>
            <Link to="/directory" className="hover:opacity-80">Directory</Link>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button><FaUserAlt size={20} /></button> 
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
