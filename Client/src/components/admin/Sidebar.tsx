import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { adminLogout } from '../../services/admin/adminapi';
import { logOut } from '../../redux/slice/authSlice';
import { useDispatch } from 'react-redux';
import { useState } from 'react';


const Sidebar: React.FC = () => {

  const location = useLocation();
  const dispatch = useDispatch()

  const [isOpen, setIsOpen] = useState(false);

  const currentPath = location.pathname;

  const isActive = (path: any) => {
    return currentPath === path;
  };

  const isRequestActive =
    isActive('/admin/request') ||
    isActive('/admin/request/transporter') ||
    isActive('/admin/request/approved') ||
    isActive('/admin/request/rejected');

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {

      const response = await adminLogout()
      console.log(response);

      dispatch(logOut())

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="w-64 bg-white h-screen shadow-md flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-400">
        <h1 className="text-3xl font-bold text-indigo-600 sidebar-logo-text">LOADEX</h1>
      </div>

      {/* Navigation Menu */}
      <div className="flex flex-col flex-1 p-4">
        <nav className="space-y-2 sidebar-nav">
          {/* Dashboard Item */}
          <Link
            to="/admin/dashboard"
            className={`flex items-center p-3 rounded-md group transition-colors ${isActive('/admin/dashboard')
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>

          {/* Transporter Item */}
          <Link
            to="/admin/transporter"
            className={`flex items-center p-3 rounded-md group transition-colors ${isActive('/admin/transporter')
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transporter
          </Link>

          {/* Shipper Item */}
          <Link
            to="/admin/shipper"
            className={`flex items-center p-3 rounded-md group transition-colors ${isActive('/admin/shipper')
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            Shipper
          </Link>

          {/* Request Item */}
          <div className="relative">
            {/* Main Request Button */}
            <button
              onClick={toggleDropdown}
              className={`w-full flex items-center p-3 rounded-md group transition-colors ${isRequestActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="flex-grow text-left">Request</span>
              {/* Dropdown arrow */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="mt-1 ml-7 pl-3  border-gray-300 space-y-1">
                <Link
                  to="/admin/request/transporter"
                  className={`flex items-center p-2 rounded-md text-sm ${isActive('/admin/request/transporter')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Transporter
                </Link>
                <Link
                  to="/admin/request/shipper"
                  className={`flex items-center p-2 rounded-md text-sm ${isActive('/admin/request/approved')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                 Shipper
                </Link>
                <Link
                  to="/admin/request/truck"
                  className={`flex items-center p-2 rounded-md text-sm ${isActive('/admin/request/rejected')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Trucks
                </Link>
              </div>
            )}
          </div>
          {/* Loads Item */}
          <Link
            to="/admin/loads"
            className={`flex items-center p-3 rounded-md group transition-colors ${isActive('/admin/loads')
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Loads
          </Link>

          {/* Payouts Item */}
          <Link
            to="/admin/payouts"
            className={`flex items-center p-3 rounded-md group transition-colors ${isActive('/admin/payouts')
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Payouts
          </Link>
        </nav>

        {/* Logout at bottom */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex w-full items-center p-3 text-white rounded-md bg-red-500 transition-colors hover:bg-red-600 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Log Out
          </button>
        </div>


      </div>
    </div>
  );
};

export default Sidebar;