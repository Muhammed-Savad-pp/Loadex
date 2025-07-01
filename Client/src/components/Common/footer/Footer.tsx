import { Link } from "react-router-dom";
import { FaInstagram } from "react-icons/fa6";
import { FaFacebookSquare } from "react-icons/fa";
import { SiYoutubekids } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { MdLocalPhone } from "react-icons/md";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";


function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-4xl  mb-6 mt-9 block logo-text">
              Loadex
            </Link>
            <div className="flex gap-4">
              <Link to="#" className="hover:opacity-80">
                <FaInstagram className="w-6 h-6" />
              </Link>
              <Link to="#" className="hover:opacity-80">
                <FaFacebookSquare className="w-6 h-6" />
              </Link>
              <Link to="#" className="hover:opacity-80">
                <SiYoutubekids className="w-6 h-6" />
              </Link>
              <Link to="#" className="hover:opacity-80">
                <FaXTwitter className="w-6 h-6" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="hover:opacity-80">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:opacity-80">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:opacity-80">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:opacity-80">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="hover:opacity-80">
                  Post Vehicle
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:opacity-80">
                  Post Load
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-3">
                <MdLocalPhone />
                <span>91-11-1234 5678</span>
              </li>
              <li className="flex items-center space-x-3">
                <IoPhonePortraitOutline/>
                <span>+91 1254635849</span>
              </li>
              <li className="flex items-center space-x-3">
                <MdEmail/>
                <span>Loadex@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaLocationDot/>
                <span>Calicut, Kerala</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center text-sm">© 2023 loadex. All Rights Reserved.</div>
      </div>
    </footer>
  )
}

export default Footer