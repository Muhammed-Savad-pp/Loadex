import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";


const TransporterProtectedRoute: React.FC = () => {

    const {isLoggedIn, role} = useSelector((state: any) => state.auth);

    if(!isLoggedIn || role !== 'transporter') {

        return <Navigate to='/login/transporter'/>
    
    }
    
    return <Outlet/>;
}

export default TransporterProtectedRoute;