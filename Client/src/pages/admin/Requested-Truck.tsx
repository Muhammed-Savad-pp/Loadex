import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { getRequestedTrucks, changeTruckVerificationStatus } from "../../services/admin/adminapi";
import { IoClose } from "react-icons/io5";
import { FiUser, FiPhone, FiFileText, FiCheck, FiX, FiTruck, FiMapPin, FiInfo } from "react-icons/fi";
import toast from "react-hot-toast";
import { GiTyre } from "react-icons/gi";



export interface ITrucks {
    _id: string;
    transporterId?: string,
    truckOwnerName?: string,
    truckOwnerMobileNo?: string,
    truckNo?: string,
    truckType?: string,
    capacity?: string,
    tyres?: string,
    driverName?: string,
    driverMobileNo?: string,
    currentLocation?: string,
    pickupLocation?: string,
    dropLocation?: string,
    verificationStatus?: string,
    operatingStates?: string[],
    rcBook?: string,
    driverLicense?: string,
    available?: boolean,
    createdAt?: Date;
}

const RequestTruck: React.FC = () => {
    const [trucks, setTrucks] = useState<ITrucks[]>([]);
    const [selectedTruck, setSelectedTruck] = useState<ITrucks | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchTransporters = async () => {
            try {
                setIsLoading(true);
                const response: any = await getRequestedTrucks();
                setTrucks(response || []);
            } catch (error) {
                console.error("Error fetching transporters:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransporters();
    }, []);

    console.log(trucks, 'trucks')

    const handleVerification  = async (id: string, status: string) => {
        try {


            const responses: any = await changeTruckVerificationStatus(id, status);
            
            toast.success(responses.response);


            const response: any = await getRequestedTrucks()
            setTrucks(response || [])

            setSelectedTruck(null)

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
                                    <div className="col-span-3">Truck RcNo</div>
                                    <div className="col-span-3">Owner Name</div>
                                    <div className="col-span-2">Truck Type</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-1 text-center">Action</div>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {trucks.length > 0 ? (
                                    trucks.map((truck, index) => (
                                        <div key={truck._id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 transition-colors duration-150">
                                            <div className="col-span-1 font-medium text-gray-900">{index + 1}</div>
                                            <div className="col-span-3 font-medium text-gray-900">{truck.truckNo}</div>
                                            <div className="col-span-3 text-gray-500">{truck.truckOwnerName}</div>
                                            <div className="col-span-2">{truck.truckType}</div>
                                            <div className="col-span-2 flex items-center">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium inline-block">
                                                    {truck.verificationStatus}
                                                </span>
                                            </div>
                                            <div className="col-span-1 text-center">
                                                <button
                                                    onClick={() => setSelectedTruck(truck)}
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

            {selectedTruck &&

                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-white flex items-center">
                                    <FiTruck className="mr-2" /> Truck Details
                                </h3>
                                <button
                                    onClick={() => setSelectedTruck(null)}
                                    className="bg-indigo-700 rounded-full p-1 text-white hover:bg-indigo-800 focus:outline-none transition-colors duration-150"
                                >
                                    <IoClose size={20} />
                                </button>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-b">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xl font-bold text-gray-800">{selectedTruck.truckNo}</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTruck.verificationStatus === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : selectedTruck.verificationStatus === 'approved'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {selectedTruck.verificationStatus?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTruck.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {selectedTruck.available ? 'Available' : 'Not Available'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-medium text-gray-800 flex items-center">
                                            <FiTruck className="mr-2 text-indigo-600" /> Truck Information
                                        </h4>

                                        <div className="space-y-3">
                                            <div className="flex items-start">
                                                <FiInfo className="mt-1 mr-3 text-indigo-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Truck Type</p>
                                                    <p className="font-medium">{selectedTruck.truckType}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <FiInfo className="mt-1 mr-3 text-indigo-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Capacity</p>
                                                    <p className="font-medium">{selectedTruck.capacity}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <GiTyre className="mt-1 mr-3 text-indigo-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Tyres</p>
                                                    <p className="font-medium">{selectedTruck.tyres}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <h4 className="text-lg font-medium text-gray-800 flex items-center pt-2">
                                            <FiUser className="mr-2 text-indigo-600" /> Owner Information
                                        </h4>

                                        <div className="space-y-3 ml-4">
                                            <div className="flex items-start">
                                                <FiUser className="mt-1 mr-3 text-indigo-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Owner Name</p>
                                                    <p className="font-medium">{selectedTruck.truckOwnerName}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <FiPhone className="mt-1 mr-3 text-indigo-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Owner Contact</p>
                                                    <p className="font-medium">{selectedTruck.truckOwnerMobileNo}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-lg font-medium text-gray-800 flex items-center">
                                            <FiUser className="mr-2 text-indigo-600" /> Driver Information
                                        </h4>

                                        <div className="space-y-3 ml-4">
                                            <div className="flex items-start">
                                                <FiUser className="mt-1 mr-3 text-indigo-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Driver Name</p>
                                                    <p className="font-medium">{selectedTruck.driverName}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <FiPhone className="mt-1 mr-3 text-indigo-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Driver Contact</p>
                                                    <p className="font-medium">{selectedTruck.driverMobileNo}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <h4 className="text-lg font-medium text-gray-800 flex items-center pt-2">
                                            <FiMapPin className="mr-2 text-indigo-600" /> Location Information
                                        </h4>

                                        <div className="space-y-3 ml-4">
                                            <div className="flex items-start">
                                                <FiMapPin className="mt-1 mr-3 text-indigo-500" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Current Location</p>
                                                    <p className="font-medium">{selectedTruck.currentLocation}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <FiMapPin className="mt-1 mr-3 text-indigo-500" />
                                                <div className="w-full">
                                                    <p className="text-sm text-gray-500">Operating States</p>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {selectedTruck.operatingStates && selectedTruck.operatingStates.length > 0 ? (
                                                            (() => {
                                                                let states = [];
                                                                try {
                                                                    if (typeof selectedTruck.operatingStates[0] === 'string' && selectedTruck.operatingStates[0].includes('[')) {
                                                                        states = JSON.parse(selectedTruck.operatingStates[0]);
                                                                    } else {
                                                                        states = selectedTruck.operatingStates;
                                                                    }
                                                                } catch (e) {
                                                                    console.error("Error parsing operating states:", e);
                                                                    states = selectedTruck.operatingStates;
                                                                }

                                                                return Array.isArray(states) ?
                                                                    states.map((state, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium inline-flex items-center"
                                                                        >
                                                                            <FiMapPin className="mr-1" size={12} />
                                                                            {state}
                                                                        </span>
                                                                    )) :
                                                                    <span className="text-gray-400 italic">Error displaying states</span>;
                                                            })()
                                                        ) : (
                                                            <span className="text-gray-400 italic">No operating states specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 border-t pt-6">
                                    <h4 className="text-lg font-medium text-gray-800 flex items-center">
                                        <FiFileText className="mr-2 text-indigo-600" /> Documents
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        {selectedTruck.rcBook && (
                                            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                                                <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                                                    <h5 className="font-medium flex items-center">
                                                        <FiFileText className="mr-2 text-indigo-500" /> RC Book
                                                    </h5>
                                                    <a
                                                        href={selectedTruck.rcBook}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition-colors duration-150"
                                                    >
                                                        Open Full Size
                                                    </a>
                                                </div>
                                                <div className="p-3">
                                                    <div className="border-2 border-gray-200 rounded-md overflow-hidden">
                                                        <div className="relative pb-[70%] bg-gray-100">
                                                            <img
                                                                src={selectedTruck.rcBook}
                                                                alt="RC Book Document"
                                                                className="absolute inset-0 w-full h-full object-contain"
                                                                onError={(e) => {
                                                                    e.currentTarget.onerror = null;
                                                                    e.currentTarget.src = "https://via.placeholder.com/400x300?text=Document+Not+Available";
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        )}

                                        {selectedTruck.driverLicense && (
                                            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                                                <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                                                    <h5 className="font-medium flex items-center">
                                                        <FiFileText className="mr-2 text-indigo-500" /> Driver License
                                                    </h5>
                                                    <a
                                                        href={selectedTruck.driverLicense}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition-colors duration-150"
                                                    >
                                                        Open Full Size
                                                    </a>
                                                </div>
                                                <div className="p-3">
                                                    <div className="border-2 border-gray-200 rounded-md overflow-hidden">
                                                        <div className="relative pb-[70%] bg-gray-100">
                                                            <img
                                                                src={selectedTruck.driverLicense}
                                                                alt="Driver License Document"
                                                                className="absolute inset-0 w-full h-full object-contain"
                                                                onError={(e) => {
                                                                    e.currentTarget.onerror = null;
                                                                    e.currentTarget.src = "https://via.placeholder.com/400x300?text=Document+Not+Available";
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedTruck.verificationStatus === 'requested' && (
                                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4 border-t">
                                    <button
                                        onClick={() => handleVerification(selectedTruck._id,'rejected')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                                    >
                                        <FiX className="mr-2" /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleVerification(selectedTruck._id, 'approved')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                                    >
                                        <FiCheck className="mr-2" /> Approve
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            }

        </div>
    );
};

export default RequestTruck;