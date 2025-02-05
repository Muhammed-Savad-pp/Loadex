import "./Navbar.css"
import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";


function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-[#E31937] to-[#FF9F1C] text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl  logo-text">
          Loadex
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:opacity-80">Home</Link>
          <Link to="/board" className="hover:opacity-80">Board</Link>
          <Link to="/services" className="hover:opacity-80">Services</Link>
          <Link to="/directory" className="hover:opacity-80">Directory</Link>
        </div>

        {/* Login and Bell Icon - Separate from Links */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="hover:opacity-80">Login</Link>
          <FaBell size={20} className="cursor-pointer" />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
