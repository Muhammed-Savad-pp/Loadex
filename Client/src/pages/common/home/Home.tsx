import Navbar from "../../../components/Common/Navbar/Navbar.tsx";
import Footer from "../../../components/Common/footer/Footer.tsx";
import "./Home.css";
import backgroundImage from "../../.././assets/pngtree-six-beautiful-kenworth-trucks-parked-on-the-edge-of-a-dirt-image_2672066.jpg";
import truck from "../../../assets/truck_blue.png";
import mapPin from "../../../assets/6572628.png";
import Shield from "../../../assets/1000_F_422174099_tylMQs8FgMWwX8g48FxOemmZvXYhSu3C.jpg";
import statusTruck from "../../../assets/istockphoto-520703835-612x612.jpg";
import { useState } from "react";
import SelectRolePage from "../../../components/Common/SelectRolePage.tsx";
import { useSelector } from "react-redux";

export default function Home() {

  const { role } = useSelector((state: any) => state.auth)

  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <Navbar onLoginClick={() => setIsLoginOpen(true)} />
      <div className={`mt-10 transition-all duration-300 ${isLoginOpen ? "blur-sm" : ""}`}>
        <section className="relative h-[500px] flex items-center">
          <div className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-white flex flex-col items-center text-center">
            <h1 className="text-6xl font-bold mb-4">Load Made Easy</h1>
            <p className="text-xl max-w-5xl">
              Empowering businesses to move loads efficiently and transport contractors to maximize their fleets.
            </p>
            {
              role === 'transporter' ? 
                <button className="border-2 border-white text-white text-lg font-semibold px-4 py-1 rounded-lg mt-3 transition duration-300 hover:bg-white hover:text-black">
                  Post Truck
                </button>
              :
                <button className="border-2 border-white text-white text-lg font-semibold px-4 py-1 rounded-lg mt-3 transition duration-300 hover:bg-white hover:text-black">
                  Post Load
                 </button>
            }
            

          </div>
        </section>
      </div>
      <section className="py-20 px-4 bg-white">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose Us?</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center border-2 border-gray-300 shadow-lg hover:shadow-2xl p-6 rounded-lg">
            <div className="flex justify-center mb-6">
              <img src={truck} alt="Truck icon" width={80} height={80} className="text-[#E31937]" />
            </div>
            <p className="text-lg font-semibold mb-4 leading-relaxed w-3/4 mx-auto">
              Post your load details and connect with reliable transport contractors instantly.
            </p>
          </div>
          <div className="text-center border-2 border-gray-300 shadow-lg hover:shadow-2xl p-6 rounded-lg">
            <div className="flex justify-center mb-6 ">
              <img src={mapPin} alt="Map Pin" className="w-20 h-20" />
            </div>
            <p className="text-lg font-semibold mb-4 leading-relaxed w-3/4 mx-auto">Discover high-demand loads and optimize your fleet operations.</p>
          </div>
          <div className="text-center border-2 border-gray-300 shadow-lg hover:shadow-2xl p-6 rounded-lg">
            <div className="flex justify-center mb-6">
              <img src={Shield} alt="shield" className="w-20 h-20" />
            </div>
            <p className="text-lg font-semibold mb-4 leading-relaxed w-3/4 mx-auto">Ensure payment and delivery security through our platform.</p>
          </div>
        </div>
      </section>
      <section
        className="py-20 bg-cover bg-center"
        style={{
          backgroundImage:
            `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${statusTruck})`
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Our Impact So Far</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white text-center">
            <div>
              <p className="text-5xl font-bold mb-2">10,000+</p>
              <p className="text-xl">Loads Delivered</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">2,000+</p>
              <p className="text-xl">Verified Transport Contractors</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">2,500+</p>
              <p className="text-xl">Partner Companies</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      {isLoginOpen && <SelectRolePage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />}
    </>
  )
}
