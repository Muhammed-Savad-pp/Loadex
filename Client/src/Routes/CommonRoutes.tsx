import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/common/home/Home";
import Login from "../pages/common/login/Login";
import Register from "../pages/common/register/Register";
import TransporterLoginProtector from "../ProtectedRoutes/TransporterLoginProtector";
import ShipperLoginProtector from "../ProtectedRoutes/ShipperLoginProtector";
import NotFound from "../pages/common/NotFound";


const CommonRoutes: React.FC = () => {
    return (
        <Routes>
            <Route element={< TransporterLoginProtector />}>
                <Route path="/login/transporter" element={<Login />} />
                <Route path="/register/transporter" element={<Register />} />
            </Route>
            <Route element={<ShipperLoginProtector />}>
                <Route path="/login/shipper" element={<Login />} />
                <Route path="/register/shipper" element={<Register />} />
            </Route>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound/>}/>

        </Routes>
    )
}

export default CommonRoutes;

