import React, { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { getShipper } from "../../services/admin/adminapi";
import { updateSipperStatus } from "../../services/admin/adminapi";
import toast from "react-hot-toast";

export interface IShipper {
    _id: string
    shipperName: string;
    email: string;
    phone: string;
    isBlocked: boolean;
}


const Shipper: React.FC = () => {

    const [shipperData , setShipperData ] = useState<IShipper[]>([])

    useEffect(() => {
        const Shipper = async () => {

            const response: any = await getShipper();
            setShipperData(response);
        }

        Shipper()

    }, [])

    console.log(shipperData)

    const handleBlockUnBlock = async (id: string) => {
        try {

            const response: any = await updateSipperStatus(id);
            toast.success(response);

            setShipperData((prev) => 
                prev.map((shipper) => 
                    shipper._id === id ? {...shipper, isBlocked: !shipper.isBlocked } : shipper
            ))
            
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong')
        }
    }

    return (
        <><div className="flex min-h-screen bg-gray-50">
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

                    {shipperData.map((shipper, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 my-2 font-semibold rounded-md shadow-sm">
                            <div className="w-1/5 flex items-center">
                                <img
                                    src="https://via.placeholder.com/30"
                                    alt="User"
                                    className="w-8 h-8 rounded-full mr-3"
                                />
                                {shipper.shipperName}
                            </div>
                            <div className="w-1/4">{shipper.email}</div>
                            <div className="w-1/5">{shipper.phone}</div>
                            <div className="w-1/6 text-center">
                                {
                                    shipper.isBlocked ?
                                        <button onClick={() => handleBlockUnBlock(shipper._id)} className="px-4 py-1 text-white rounded-full bg-red-500 "> Block </button> :
                                        <button onClick={() => handleBlockUnBlock(shipper._id)} className="px-4 py-1 text-white rounded-full bg-green-500 "> UnBlock </button>
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

export default Shipper