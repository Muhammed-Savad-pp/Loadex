import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { getRequestedShipper, changeShipperVerificationStatus } from "../../services/admin/adminapi";
import { IoClose } from "react-icons/io5";
import { FiUser, FiMail, FiPhone, FiFileText, FiCheck, FiX, FiBriefcase, FiHash } from "react-icons/fi";
import toast from "react-hot-toast";

export interface IShipper {
    _id: string;
    shipperName: string;
    companyName: string;
    gstNumber: string;
    verificationStatus: string;
    email: string;
    phone: string;
    panNumber: string;
    aadhaarFront: string;
    aadhaarBack: string;
}

const RequestShipper: React.FC = () => {
    const [shippers, setShippers] = useState<IShipper[]>([]);
    const [selectedShipper, setSelectedShiper] = useState<IShipper | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchTransporters = async () => {
            try {
                setIsLoading(true);
                const response: any = await getRequestedShipper();
                setShippers(response || []);
            } catch (error) {
                console.error("Error fetching transporters:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransporters();
    }, []);

    console.log(shippers);


   

    const handleVerificationStatusChange = async (id: string, status: string) => {
        try {


            const response = await changeShipperVerificationStatus(id, status);
            toast.success(response as string);


            const shippers: any = await getRequestedShipper()
            setShippers(shippers || [])

            setSelectedShiper(null)

        } catch (error) {
            console.log(error)
        }
    }

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
                                    <div className="col-span-4">Name</div>
                                    <div className="col-span-4">Email</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-1 text-center">Action</div>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {shippers.length > 0 ? (
                                    shippers.map((shipper, index) => (
                                        <div key={shipper._id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 transition-colors duration-150">
                                            <div className="col-span-1 font-medium text-gray-900">{index + 1}</div>
                                            <div className="col-span-4 font-medium text-gray-900">{shipper.shipperName}</div>
                                            <div className="col-span-4 text-gray-500">{shipper.email}</div>
                                            <div className="col-span-2 flex items-center ">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium inline-block">
                                                    {shipper.verificationStatus}
                                                </span>
                                            </div>                                           
                                            <div className="col-span-1 text-center">
                                                <button
                                                    onClick={() => setSelectedShiper(shipper)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">No transporter requests found.</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {selectedShipper && (
                <div className="fixed inset-0 overflow-y-auto z-50">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setSelectedShiper(null)}></div>
                        </div>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                {/* Repositioned close button to align with the top right corner */}
                                <div className="absolute top-0 right-0 pt-4 pr-4">
                                    <button
                                        type="button"
                                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                        onClick={() => setSelectedShiper(null)}
                                    >
                                        <span className="sr-only">Close</span>
                                        <IoClose className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        {/* Moved header with status badge to a flex container with space-between */}
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Transporter Details</h3>
                                            <div className="flex items-center mr-5 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                {selectedShipper.verificationStatus}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center">
                                                    <FiUser className="mr-2 text-indigo-600" />
                                                    <span className="text-sm font-medium text-gray-600">Name:</span>
                                                    <span className="ml-2 text-sm text-gray-900">{selectedShipper.shipperName}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <FiBriefcase className="mr-2 text-indigo-600" />
                                                    <span className="text-sm font-medium text-gray-600">Company:</span>
                                                    <span className="ml-2 text-sm text-gray-900">{selectedShipper.companyName}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <FiMail className="mr-2 text-indigo-600" />
                                                    <span className="text-sm font-medium text-gray-600">Email:</span>
                                                    <span className="ml-2 text-sm text-gray-900">{selectedShipper.email}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <FiPhone className="mr-2 text-indigo-600" />
                                                    <span className="text-sm font-medium text-gray-600">Phone:</span>
                                                    <span className="ml-2 text-sm text-gray-900">{selectedShipper.phone}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <FiFileText className="mr-2 text-indigo-600" />
                                                    <span className="text-sm font-medium text-gray-600">PAN Number:</span>
                                                    <span className="ml-2 text-sm text-gray-900">{selectedShipper.panNumber}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <FiHash className="mr-2 text-indigo-600" />
                                                    <span className="text-sm font-medium text-gray-600">GST Number:</span>
                                                    <span className="ml-2 text-sm text-gray-900">{selectedShipper.gstNumber}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Aadhaar Verification Documents</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-600">Front Side</p>
                                                    <div className="relative group">
                                                        <img
                                                            src={selectedShipper.aadhaarFront}
                                                            alt="Aadhaar Front"
                                                            className="w-full h-48 object-cover rounded-md border border-gray-300 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                                                        />
                                                        <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 rounded-md transition-opacity duration-300"></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-600">Back Side</p>
                                                    <div className="relative group">
                                                        <img
                                                            src={selectedShipper.aadhaarBack}
                                                            alt="Aadhaar Back"
                                                            className="w-full h-48 object-cover rounded-md border border-gray-300 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                                                        />
                                                        <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 rounded-md transition-opacity duration-300"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={() => handleVerificationStatusChange(selectedShipper._id, 'approved')}
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    <FiCheck className="mr-2 mt-1" /> Approve
                                </button>
                                <button
                                    onClick={() => handleVerificationStatusChange(selectedShipper._id, 'rejected')}
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    <FiX className="mr-2 mt-1" /> Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default RequestShipper;