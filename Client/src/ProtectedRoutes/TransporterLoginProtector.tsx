import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";


const TransporterLoginProtector : React.FC = () => {
    const { isLoggedIn, role} = useSelector((state: any) => state.auth)

    console.log(isLoggedIn,'isLoging')

    if(isLoggedIn && role == 'transporter') {
        return <Navigate to={'/'} replace/>
    }

    return <Outlet/>
}

export default TransporterLoginProtector