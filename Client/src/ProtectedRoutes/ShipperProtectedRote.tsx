import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";


const ShipperProtectedRoute: React.FC = () => {

    const {isLoggedIn, role} = useSelector((state: any) => state.auth);

    if(!isLoggedIn || role !== 'shipper') {
        return <Navigate to={'/login/shipper'}/>
    }

    return <Outlet/>

}

export default ShipperProtectedRoute