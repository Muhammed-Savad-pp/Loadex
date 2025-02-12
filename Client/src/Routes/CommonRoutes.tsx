import React from "react";

import { Route, Routes } from "react-router-dom";

import Home from "../pages/common/home/Home";
import Login from "../pages/common/login/Login";
import Register from "../pages/common/register/Register";


const CommonRoutes : React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/transporter/login" element={<Login/>}/>
            <Route path="/shipper/login" element={<Login/>}/>
            <Route path="/shipper/register" element={<Register/>}/>
            <Route path="/transporter/register" element={<Register/>}/>
            
        </Routes>
    )
}

export default CommonRoutes;

