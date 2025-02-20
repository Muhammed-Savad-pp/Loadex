import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";


const ShipperLoginProtector : React.FC = () => {

    const {isLoggedIn,  role } = useSelector((state: any) => state.auth)

    if(isLoggedIn && role === 'shipper'){
        return <Navigate to={'/'} replace/>
    }

    return <Outlet/>
}

export default ShipperLoginProtector