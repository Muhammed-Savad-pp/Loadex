import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import TransporterLoginProtector from "../ProtectedRoutes/TransporterLoginProtector";
import ShipperLoginProtector from "../ProtectedRoutes/ShipperLoginProtector";

// Lazy-loaded pages
const Home = lazy(() => import("../pages/common/home/Home"));
const Login = lazy(() => import("../pages/common/login/Login"));
const Register = lazy(() => import("../pages/common/register/Register"));
const NotFound = lazy(() => import("../pages/common/NotFound"));

const CommonRoutes: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route element={<TransporterLoginProtector />}>
                    <Route path="/login/transporter" element={<Login />} />
                    <Route path="/register/transporter" element={<Register />} />
                </Route>
                <Route element={<ShipperLoginProtector />}>
                    <Route path="/login/shipper" element={<Login />} />
                    <Route path="/register/shipper" element={<Register />} />
                </Route>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default CommonRoutes;
