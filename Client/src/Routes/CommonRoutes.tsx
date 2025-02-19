import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/common/home/Home";
import Login from "../pages/common/login/Login";
import Register from "../pages/common/register/Register";
import TransporterLoginProtector from "../ProtectedRoutes/TransporterLoginProtector";


const CommonRoutes : React.FC = () => {
    return (
        <Routes>
            <Route element={< TransporterLoginProtector />}>
                <Route path="/transporter/login" element={<Login/>}/>
                <Route path="/transporter/register" element={<Register/>}/>
            </Route>
            <Route path="/" element={<Home/>}/>
            
            <Route path="/shipper/login" element={<Login/>}/>
            <Route path="/shipper/register" element={<Register/>}/>
            
            
        </Routes>
    )
}

export default CommonRoutes;

