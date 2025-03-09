import React, { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { useEffect } from "react";
import { getTransporter, updateTransporterBlockandUnblock} from "../../services/admin/adminapi";
import toast from "react-hot-toast";

export interface ITransporter {
    _id: string
    transporterName: string;
    email: string;
    phone: string;
    isBlocked: boolean;
}
const Transporter: React.FC = () => {

    const [transporter, setTransporter] = useState<ITransporter[]>([])

    useEffect(() => {

        const gettransporter = async () => {

            const response: any = await getTransporter()
            setTransporter(response)

        }

        gettransporter()

    }, [])

    
    const handleBlockUnBlock = async (id: string) => {
        try {

            const response: any = await updateTransporterBlockandUnblock(id);
            toast.success(response);

            setTransporter((prev) => 
                prev.map((transporter) => 
                    transporter._id === id ? {...transporter, isBlocked: !transporter.isBlocked } : transporter
            ))
            
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong')
        }
    }


    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="min-h-screen w-full bg-blue-50 flex justify-center  p-6 pt-10">
                    <div className="w-full h-fit  bg-white rounded-lg shadow-md p-4">
                        {/* Header Row */}
                        <div className="flex items-center justify-between bg-gray-100 text-lg p-3 rounded-md text-gray-600 font-bold">
                            <div className="w-1/5">Name</div>
                            <div className="w-1/4">Email</div>
                            <div className="w-1/5">Mobile</div>
                            <div className="w-1/6 text-center">Action</div>
                            <div className="w-1/6 text-center">Details</div>
                        </div>

                        {transporter.map((transporter, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 my-2 font-semibold rounded-md shadow-sm">
                                <div className="w-1/5 flex items-center">
                                    <img
                                        src="https://via.placeholder.com/30"
                                        alt="User"
                                        className="w-8 h-8 rounded-full mr-3"
                                    />
                                    {transporter.transporterName}
                                </div>
                                <div className="w-1/4">{transporter.email}</div>
                                <div className="w-1/5">{transporter.phone}</div>
                                <div className="w-1/6 text-center">
                                    {
                                        transporter.isBlocked ? 
                                         <button onClick={() => handleBlockUnBlock(transporter._id)} className="px-4 py-1 text-white rounded-full bg-red-500 "> Block </button>  :
                                         <button onClick={() => handleBlockUnBlock(transporter._id)} className="px-4 py-1 text-white rounded-full bg-green-500 "> UnBlock </button>   
                                    }
                                    
                                </div>
                                <div className="w-1/6 text-center">
                                    <button className="px-4 py-1 bg-blue-500 text-white rounded-full">Details</button>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div >
        </>
    )

}

export default Transporter