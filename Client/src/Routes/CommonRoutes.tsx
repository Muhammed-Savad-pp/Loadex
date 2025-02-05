import React from "react";

import { Route, Routes } from "react-router-dom";

import Home from "../pages/common/Home";


const CommonRoutes : React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home/>}/>
        </Routes>
    )
}

export default CommonRoutes;

