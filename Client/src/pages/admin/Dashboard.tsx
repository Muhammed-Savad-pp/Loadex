import React from "react";
import Sidebar from "../../components/admin/Sidebar";
import DashboardContent from "../../components/admin/DashboardContent";

const Dashboard : React.FC = () => {

    return(
       <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar/>
                <DashboardContent/>
            </div>
       </>
    ) 
} 

export default Dashboard
