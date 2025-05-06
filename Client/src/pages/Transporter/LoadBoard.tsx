import React, { FormEvent, useEffect, useState } from "react";
import Navbar from "../../components/Common/Navbar/Navbar";
import { fetchLoads } from "../../services/transporter/transporterApi";
import Footer from "../../components/Common/footer/Footer";
import toast from "react-hot-toast";
import { sendBid } from "../../services/transporter/transporterApi";

interface LoadItem {
    _id: string;
    shipperId: {
        companyName: string,
        shipperName: string,
        _id: string
    };
    pickupLocation: string;
    dropLocation: string;
    material: string;
    quantity: number;
    scheduledDate: Date;
    length: string;
    truckType: string;
    transportationRent: number;
    height: string;
    breadth: string;
    descriptions: string;
    pickupCoordinates: {
        latitude: number,
        longitude: number
    };
    dropCoordinates: {
        latitude: number,
        longitude: number
    };
    distanceInKm: number
}

interface IFormData {
    truckNo: string;
    rent: string;
    shipperId: string;
    loadId: string;
}

const LoadBoard: React.FC = () => {

    const [loads, setLoads] = useState<LoadItem[]>([]);
    const [selectedLoad, setSelectedLoad] = useState<LoadItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formError, setFormError] = useState<Partial<IFormData>>()
    const [formData, setFormData] = useState<Partial<IFormData>>({
        truckNo: '',
        rent: '',
        shipperId: '',
        loadId: ''
    })    

    useEffect(() => {
        const findLoads = async () => {
            const response: any = await fetchLoads();
            console.log(response);
            setLoads(response);
        };

        findLoads();
    }, []);

    const openModal = (load: LoadItem) => {
        setSelectedLoad(load);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedLoad(null);
        setFormError({})
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const validateForm = (formData: Partial<IFormData>) => {
        const errors: Partial<IFormData> = {}

        if (!(formData.truckNo?.trim())) errors.truckNo = 'Please enter your Truck no';
        if (!(formData.rent?.trim())) errors.rent = 'Please enter your Rate';

        return errors;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const validateErrors = validateForm({
            truckNo: formData.truckNo ?? '',
            rent: formData.rent ?? '',
            shipperId: formData.shipperId ?? '',
            loadId: formData.loadId ?? ''
        });

        setFormError(validateErrors);

        if (Object.keys(validateErrors).length > 0) {
            toast.error('Please Fix this Error');
            return;
        }

        const formDataToSend = new FormData();

        formDataToSend.append('truckNo', formData.truckNo ?? '');
        formDataToSend.append('rent', formData.rent ?? '');
        formDataToSend.append('loadId', selectedLoad?._id ?? '');
        formDataToSend.append('shipperId', selectedLoad?.shipperId._id ?? '')
        try {            
            const  response: any = await sendBid(formDataToSend);
            if(!response.success){
                toast.error(response.message)
            }else{
                setIsModalOpen(false)
                toast.success(response.message)
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto mt-8 mb-8 p-4 rounded-md bg-gray-50">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Load Board</h1>

                <div className="grid grid-cols-1 gap-4">
                    <div className="hidden md:grid md:grid-cols-8 bg-gray-200 rounded-t-lg p-3  font-semibold text-md text-gray-800">
                        <div className="px-2">Company Name</div>
                        <div className="px-2">Pickup Location</div>
                        <div className="px-2">Drop Location</div>
                        <div className="px-2">Material</div>
                        <div className="px-2 text-center">Quantity (MT)</div>
                        <div className="px-2 text-center">Rent (₹)</div>
                        <div className="px-2 text-center">Date</div>
                        <div className="px-2 text-center">Actions</div>
                    </div>

                    {loads.map((load) => (
                        <div key={load._id} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="hidden md:grid md:grid-cols-8 p-3 items-center hover:bg-gray-50">
                                <div className="px-2 text-sm text-gray-900">{load.shipperId.companyName}</div>
                                <div className="px-2 text-sm text-gray-900">{load.pickupLocation}</div>
                                <div className="px-2 text-sm text-gray-900">{load.dropLocation}</div>
                                <div className="px-2 text-sm text-gray-900">{load.material}</div>
                                <div className="px-2 text-sm text-gray-900 text-center">{load.quantity}</div>
                                <div className="px-2 text-sm text-gray-900 text-center">₹{load.transportationRent.toLocaleString()}</div>
                                <div className="px-2 text-sm text-gray-900 text-center">{new Date(load.scheduledDate).toLocaleDateString()}</div>
                                <div className="px-2 text-sm text-center">
                                    <button
                                        onClick={() => openModal(load)}
                                        className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 mr-2"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>

                            {/* Mobile view - card format */}
                            <div className="md:hidden p-4">
                                <div className="flex justify-between mb-2">
                                    <div className="font-medium text-gray-800">{load.shipperId.companyName}</div>
                                    <div className="text-right text-sm">
                                        {new Date(load.scheduledDate).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex items-center mb-3">
                                    <div className="mr-2 text-blue-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{load.pickupLocation}</div>
                                        <div className="text-xs text-gray-500">Pickup</div>
                                    </div>
                                </div>

                                <div className="flex items-center mb-3">
                                    <div className="mr-2 text-red-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{load.dropLocation}</div>
                                        <div className="text-xs text-gray-500">Destination</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                                    <div>
                                        <div className="text-gray-500 text-xs">Material</div>
                                        <div>{load.material}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs">Quantity</div>
                                        <div>{load.quantity} MT</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs">Rent</div>
                                        <div>₹{load.transportationRent.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openModal(load)}
                                        className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal for load details */}
                {isModalOpen && selectedLoad && (
                    <div className="fixed inset-0 flex items-center justify-center z-50  backdrop-blur-sm backdrop-brightness-70">
                        <div className="bg-white rounded-lg shadow-xl w-11/12 sm:w-4/5 md:w-3/4 lg:w-3/5 max-h-[75vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 border-b flex items-center justify-between rounded-t-lg">
                                <h3 className="text-lg font-semibold text-white">Load Details</h3>
                                <button onClick={closeModal} className="text-white hover:text-gray-200 focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body - Compact but with all sections */}
                            <div className="p-4 space-y-3">
                                {/* Shipper Information */}
                                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        Shipper Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-600 text-xs">Company Name</span>
                                            <p className="font-medium">{selectedLoad.shipperId.companyName}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs">Shipper Name</span>
                                            <p className="font-medium">{selectedLoad.shipperId.shipperName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Route Information */}
                                <div className="bg-green-50 p-3 rounded-md border border-green-100">
                                    <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        Route Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start">
                                            <div className="bg-blue-600 p-1 rounded-full mt-1 mr-2 h-3 w-3"></div>
                                            <div>
                                                <span className="text-gray-600 text-xs">Pickup Location</span>
                                                <p className="font-medium">{selectedLoad.pickupLocation}</p>
                                            </div>
                                        </div>

                                        <div className="ml-4 border-l-2 border-dashed border-gray-500 h-4"></div>

                                        <div className="flex items-start">
                                            <div className="bg-red-600 p-1 rounded-full mt-1 mr-2 h-3 w-3"></div>
                                            <div>
                                                <span className="text-gray-600 text-xs">Drop Location</span>
                                                <p className="font-medium">{selectedLoad.dropLocation}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Load Information */}
                                <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
                                    <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                        </svg>
                                        Load Information
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-600 text-xs">Material</span>
                                            <p className="font-medium">{selectedLoad.material}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs">Quantity</span>
                                            <p className="font-medium">{selectedLoad.quantity} MT</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs">Date</span>
                                            <p className="font-medium">{new Date(selectedLoad.scheduledDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs">Rent</span>
                                            <p className="font-medium">₹{selectedLoad.transportationRent.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs">Truck Type</span>
                                            <p className="font-medium">{selectedLoad.truckType}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs">Distance</span>
                                            <p className="font-medium">{selectedLoad.distanceInKm}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dimension Information */}
                                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                                    <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5z" clipRule="evenodd" />
                                        </svg>
                                        Dimensions
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-600 text-xs">Length</span>
                                            <p className="font-medium">{selectedLoad.length}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs">Breadth</span>
                                            <p className="font-medium">{selectedLoad.breadth}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-xs">Height</span>
                                            <p className="font-medium">{selectedLoad.height}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedLoad.descriptions && (
                                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Additional Information
                                        </h4>
                                        <p className="text-sm">{selectedLoad.descriptions}</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 m-4 bg-gray-100 border border-gray-200">
                                <form onSubmit={(e) => handleSubmit(e)}>
                                    <div className="flex items-center space-x-6">
                                        <div className="flex flex-col">
                                            <label className="mb-1 text-gray-600 text-sm font-medium">Enter Truck No.</label>
                                            <input type="text" name="truckNo" value={formData?.truckNo} onChange={handleChange} className="border border-gray-400 p-1 rounded-md w-60" />
                                            <div className="h-5">
                                                {formError?.truckNo &&  <p className="text-red-600 text-sm mt-1">{formError?.truckNo}</p>}
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="mb-1 text-gray-600 text-sm font-medium">Enter Your Price.</label>
                                            <input type="text" name="rent" value={formData?.rent} onChange={handleChange} className="border border-gray-400 p-1 rounded-md w-60" />
                                            <div className="h-5">
                                            {formError?.rent && <p className="text-sm text-red-600 mt-1">{formError.rent}</p>}

                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons Container - Moves below the inputs */}
                                    <div className="bg-gray-100 px-4 py-3 border-t flex justify-end mt-5 rounded-b-lg">
                                        <button onClick={closeModal} type="button" className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 mr-2 text-sm">Close</button>
                                        <button type="submit" className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 text-sm">Send Bid</button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default LoadBoard;