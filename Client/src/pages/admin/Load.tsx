import React, { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { getLoads } from "../../services/admin/adminapi";

interface ILoad {
    material: string,
    quantity: string,
    transportationRent: string,
    createdAt: Date,
}


const Load: React.FC = () => {

    const [loads, setLoads] = useState<ILoad[]>([]);

    useEffect(() => {
        const findLoads = async () => {
            try {
                const response: any = await getLoads();
                // Convert createdAt to a Date object
                const formattedLoads = response.map((load: any) => ({
                    ...load,
                    createdAt: new Date(load.createdAt),
                }));
                setLoads(formattedLoads || []);
            } catch (error) {
                console.log(error);
            }
        };
        findLoads();
    }, []);

    console.log(loads);


    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="min-h-screen w-full bg-blue-50 flex justify-center  p-6 pt-10">
                    <div className="w-full h-fit  bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center justify-between bg-gray-100 text-lg p-3 rounded-md text-gray-600 font-bold">
                            <div className="w-1/5">Material</div>
                            <div className="w-1/4">Quantity</div>
                            <div className="w-1/5">TransportationRent</div>
                            <div className="w-1/6 ">Date</div>
                            <div className="w-1/6 ">Details</div>
                        </div>

                        {loads.map((load, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 my-2 font-semibold rounded-md shadow-sm">
                                <div className="w-1/5 flex items-center">
                                 
                                    {load.material}
                                </div>
                                <div className="w-1/4">{load.quantity}</div>
                                <div className="w-1/5">{load.transportationRent}</div>
                                <div className="w-1/6">{new Date(load.createdAt).toLocaleDateString()}</div>
                                <div className="w-1/6 ">
                                    <button className="px-4 py-1 bg-blue-500 text-white rounded-full">Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Load;