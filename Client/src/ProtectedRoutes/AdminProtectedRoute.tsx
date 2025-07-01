import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute : React.FC = () => {

    const {isLoggedIn, role} = useSelector((state: any) => state.auth);

    if(!isLoggedIn && role !== 'admin') {
        return <Navigate to={'/admin/login'}/>
    }

    return <Outlet/>

}

export default AdminProtectedRoute