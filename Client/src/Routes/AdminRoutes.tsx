
import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/admin/Login";
import Dashboard from "../pages/admin/Dashboard";
import AdminLoginProtector from "../ProtectedRoutes/AdminLoginProtector";
import AdminProtectedRoute from "../ProtectedRoutes/AdminProtectedRoute";
import Transporter from "../pages/admin/Transporter";
import RequestTransporter from "../pages/admin/Request-Transporter";
import Shipper from "../pages/admin/Shipper";
import RequestShipper from "../pages/admin/Request-Shipper";
import RequestTruck from "../pages/admin/Requested-Truck";
import Load from "../pages/admin/Load";
import NotFound from "../pages/common/NotFound";
import Trips from "../pages/admin/Trips";
import PaymentHistory from "../pages/admin/PaymentHistory";


const AdminRoutes = () => {
    return (
        
        <Routes>
            <Route element={<AdminLoginProtector/>}> 
                <Route path="/login" element={<LoginPage/>} />
            </Route>
            
            <Route element={< AdminProtectedRoute/>}>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/transporter" element={<Transporter/>}/>
                <Route path="/shipper" element={<Shipper/>}/>
                <Route path="/request/transporter" element={<RequestTransporter/>}/>
                <Route path="/request/shipper" element={<RequestShipper/>}/>
                <Route path="/request/truck" element={<RequestTruck />}/>
                <Route path="/loads" element={<Load/>}/>
                <Route path="/trips" element={<Trips/>}/>
                <Route path="/paymentHistory" element={<PaymentHistory/>}/>
                <Route path="*" element={<NotFound/>}/>
                
            </Route>
        </Routes>


    )
}

export default AdminRoutes