import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";


const AdminLoginProtector: React.FC = () => {

    const {isLoggedIn, role} = useSelector((state: any) => state.auth);

    if(isLoggedIn && role == 'admin'){
        return <Navigate to={'/admin/dashboard'}/>
    }

    return <Outlet/>

}

export default AdminLoginProtector