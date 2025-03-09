import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
// import { getRequestTransporter } from "../../services/admin/adminapi";
import { IoClose } from "react-icons/io5";
import { FiUser, FiMail, FiPhone, FiFileText, FiCheck, FiX } from "react-icons/fi";
// import { changeVerificationStatus } from "../../services/admin/adminapi";
import toast from "react-hot-toast";

// export interface ITransporter {
//     _id: string;
//     transporterName: string;
//     verificationStatus: string;
//     email: string;
//     phone: string;
//     panNumber: string;
//     aadhaarFront: string;
//     aadhaarBack: string;
// }

const RequestTruck: React.FC = () => {
    // const [transporters, setTransporters] = useState<ITransporter[]>([]);
    // const [selectedTransporter, setSelectedTransporter] = useState<ITransporter | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // useEffect(() => {
    //     const fetchTransporters = async () => {
    //         try {
    //             setIsLoading(true);
    //             const response: any = await getRequestTransporter();
    //             setTransporters(response.transporters || []);
    //         } catch (error) {
    //             console.error("Error fetching transporters:", error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };

    //     fetchTransporters();
    // }, []);



    // const handleVerificationStatusChange  = async (id: string, status: string) => {
    //     try {


    //         const response: any = await changeVerificationStatus(id, status);
    //         toast.success(response);


    //         const transporterss: any = await getRequestTransporter()
    //         setTransporters(transporterss.transporters || [])

    //         setSelectedTransporter(null)

    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Transporter Requests</h1>
                    <p className="text-gray-600">Manage and review transporter verification requests</p>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center p-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-50 border-b border-gray-200">
                                <div className="grid grid-cols-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="col-span-1">No</div>
                                    <div className="col-span-3">Truck RcNo</div>
                                    <div className="col-span-3">Owner Name</div>
                                    <div className="col-span-2">Type</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-1 text-center">Action</div>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {/* {transporters.length > 0 ? (
                                    transporters.map((transporter, index) => (
                                        <div key={transporter._id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 transition-colors duration-150">
                                            <div className="col-span-1 font-medium text-gray-900">{index + 1}</div>
                                            <div className="col-span-4 font-medium text-gray-900">{transporter.transporterName}</div>
                                            <div className="col-span-4 text-gray-500">{transporter.email}</div>
                                            <div className="col-span-2">{getStatusBadge(transporter.verificationStatus)}</div>
                                            <div className="col-span-1 text-center">
                                                <button
                                                    onClick={() => setSelectedTransporter(transporter)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">No transporter requests found.</div>
                                )} */}
                            </div>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};

export default RequestTruck;