import React, { useEffect, useState } from "react";
import ShipperProfileSidebar from "../../components/shipper/ShipperProfileSidebar";
import Navbar from "../../components/Common/Navbar/Navbar";
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";
import { getShipperProfile, shipperKycSumbit } from "../../services/shipper/shipperService";


interface Shipperdata {
    shipperName: string;
    email: string;
    phone: string;
    verificationStatus?: string;
    panNumber?: string;
    aadhaarFront?: string;
    aadhaarBack?: string;
    companyName?: string;
    gstNumber?: string
}

interface KYCData {
    companyName: string;
    panNumber: string;
    gstNumber: string
    aadhaarFront: File | null;
    aadhaarBack: File | null;
}

const statusStyles: Record<string, string> = {
    pending: "bg-amber-200 text-amber-700 border-amber-300",
    requested: "bg-blue-200 text-blue-700 border-blue-300",
    rejected: "bg-red-200 text-red-700 border-red-300",
    approved: "bg-green-200 text-green-700 border-green-300"
};


const Profile = () => {

    const [shipperData, setShipperData] = useState<Shipperdata | null>(null)
    // console.log(transporterData,'ddd');


    useEffect(() => {
        const getProfileData = async () => {

            const response: any = await getShipperProfile()

            if (response.success) {
                setShipperData(response.shipperData)
            }

        }
        getProfileData()
    }, [])

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const [kycData, setKycData] = useState<KYCData>({
        companyName: '',
        gstNumber: '',
        panNumber: '',
        aadhaarFront: null,
        aadhaarBack: null,
    });

    // console.log(kycData, 'kycData')

    const [previews, setPreviews] = useState({
        aadhaarFront: '',
        aadhaarBack: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKycData({ ...kycData, [e.target.name] : e.target.value });
    };

    const handleFileChange = (type: 'front' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            // Create preview URL for the image
            const previewUrl = URL.createObjectURL(file);
            setPreviews(prev => ({
                ...prev,
                [type === 'front' ? 'aadhaarFront' : 'aadhaarBack']: previewUrl
            }));
        }

        setKycData(prev => ({
            ...prev,
            [type === 'front' ? 'aadhaarFront' : 'aadhaarBack']: file
        }));
    };

    // Cleanup preview URLs when component unmounts
    useEffect(() => {
        return () => {
            if (previews.aadhaarFront) URL.revokeObjectURL(previews.aadhaarFront);
            if (previews.aadhaarBack) URL.revokeObjectURL(previews.aadhaarBack);
        };
    }, [previews]);

    const handleKYCSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Create FormData object to handle file uploads
        const formData = new FormData();
        formData.append('companyName', kycData.companyName);
        formData.append('panNumber', kycData.panNumber);
        formData.append('gstNumber', kycData.gstNumber );

        if (kycData.aadhaarFront) {
            formData.append('aadhaarFront', kycData.aadhaarFront);
        }

        if (kycData.aadhaarBack) {
            formData.append('aadhaarBack', kycData.aadhaarBack);
        }

        try {
            const response: any = await shipperKycSumbit(formData);
            console.log(response)

            if (response.success) {
                setShipperData((prev) => ({
                    ...prev,
                    panNumber: response.shipperData.panNumber,
                    companyName: response.shipperData.companyName,
                    gstNumber: response.shipperData.gstNumber,
                    aadhaarFront: response.shipperData.aadhaarFront,
                    aadhaarBack: response.shipperData.aadhaarBack,
                    verificationStatus: response.shipperData.verificationStatus,
                    shipperName: prev?.shipperName ?? '', 
                    email: prev?.email ?? '',
                    phone: prev?.phone ?? ''
                }))
            }

        } catch (error) {
            console.error('Error submitting KYC data:', error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen bg-gray-100">
                {/* Sidebar on the left */}

                <ShipperProfileSidebar />


                {/* Right Side Content */}
                <div className="flex-grow flex flex-col justify-center p-10 space-y-6">
                    <div className="bg-white p-8 rounded-lg shadow-md w-full h-100">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center">
                            <img
                                src="/api/placeholder/100/100"
                                alt="Profile"
                                className="w-24 h-24 rounded-full bg-sky-200 mb-4"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Name Input */}
                                <div className="relative">
                                    <p className="text-gray-600 font-bold mb-1">Name</p>
                                    <div className="flex items-center rounded-md px-3 py-2 bg-gray-100 shadow-lg focus-within:ring-2 focus-within:ring-blue-400">
                                        <FaUser className="text-gray-400 mr-2" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={shipperData?.shipperName}
                                            // onChange={handleChange}
                                            readOnly={!isEditing}
                                            className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>

                                {/* Email Input */}
                                <div className="relative">
                                    <p className="text-gray-600 font-bold mb-1">Email</p>
                                    <div className="flex items-center rounded-md px-3 py-2 bg-gray-100  shadow-lg focus-within:ring-2 focus-within:ring-blue-400">
                                        <FaEnvelope className="text-gray-400 mr-2" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={shipperData?.email}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Number Input */}
                            <div className="relative w-1/2">
                                <p className="text-gray-600 font-bold mb-1">Mobile Number</p>
                                <div className="flex items-center rounded-md px-3 py-2 bg-gray-100  shadow-lg focus-within:ring-2 focus-within:ring-blue-400">
                                    <FaPhone className="text-gray-400 mr-2" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={shipperData?.phone}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                        className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
                                        placeholder="Enter your mobile number"
                                    />
                                </div>
                            </div>

                            {/* Buttons Section */}
                            <div className="flex justify-between mt-4">
                                {/* Edit Button */}
                                <button
                                    onClick={toggleEdit}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 shadow-md transition"
                                >
                                    {isEditing ? "Save" : "Edit"}
                                </button>

                                {/* Change Password Button */}
                                <button className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2 rounded-md hover:bg-gray-800 shadow-md transition">
                                    <FaLock className="text-white" />
                                    Change Password
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md w-full">
                        <form onSubmit={handleKYCSubmit} >
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-semibold text-gray-700">KYC Verification</h3>
                                
                                {shipperData?.verificationStatus && (
                                    <div
                                        className={`px-3 py-0.5 rounded-full text-sm font-medium shadow-md border
                                            ${statusStyles[shipperData.verificationStatus] || "bg-gray-200 text-gray-700 border-gray-300"}`}
                                    >
                                        {shipperData.verificationStatus.charAt(0).toUpperCase() + shipperData.verificationStatus.slice(1)}
                                    </div>
                                )}
                            </div>



                            <div className="mb-5 w-70 mt-3">
                                <label className="text-gray-600 block mb-1 font-bold">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="Enter Company Name"
                                    value={shipperData?.companyName || kycData.companyName}
                                    onChange={handleInputChange}
                                    readOnly={!!shipperData?.companyName}
                                    className="w-full shadow-lg  px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 outline-none bg-gray-100 text-gray-700 placeholder-gray-400"
                                />
                            </div>
                            <div className="flex flex-wrap gap-4 mt-3">
                                <div className="flex-1">
                                    <label className="text-gray-600 block mb-1 font-bold">PAN Number</label>
                                    <input
                                        type="text"
                                        name="panNumber"
                                        value={shipperData?.panNumber || kycData.panNumber}
                                        readOnly={!!shipperData?.panNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter PAN Number"
                                        className="w-full shadow-lg px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-700 placeholder-gray-400"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-gray-600 block mb-1 font-bold">GST Number</label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={shipperData?.gstNumber || kycData.gstNumber}
                                        onChange={handleInputChange}
                                        readOnly={!!shipperData?.gstNumber}
                                        placeholder="Enter GST Number"
                                        className="w-full shadow-lg px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-700 placeholder-gray-400"
                                    />
                                </div>
                            </div>



                            <div className="grid grid-cols-2 gap-6 mt-6 mb-4">
                                <div className="border-dashed border-2 border-gray-500 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400">
                                    <p className="text-gray-500 text-sm mb-2">Upload Aadhaar Front</p>
                                    <label className="cursor-pointer w-full">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange('front')}
                                            accept="image/*"
                                        key={kycData.aadhaarFront ? 'front-with-file' : 'front-empty'}
                                        />
                                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-md shadow overflow-hidden">
                                            {shipperData?.aadhaarFront ? (
                                                <img src={shipperData.aadhaarFront} alt="Aadhaar Front" className="w-full h-full object-contain" />
                                            ) : previews.aadhaarFront ? (
                                                <img src={previews.aadhaarFront} alt="Aadhaar Front Preview" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-gray-400 text-3xl">+</span>
                                            )}
                                        </div>
                                    </label>
                                </div>

                                <div className="border-dashed border-2 border-gray-500 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400">
                                    <p className="text-gray-500 text-sm mb-2">Upload Aadhaar Back</p>
                                    <label className="cursor-pointer w-full">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange('back')}
                                            accept="image/*"
                                        key={kycData.aadhaarBack ? 'back-with-file' : 'back-empty'}
                                        />
                                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-md shadow overflow-hidden">
                                            {shipperData?.aadhaarBack ? (
                                                <img src={shipperData.aadhaarBack} alt="Aadhaar Back" className="w-full h-full object-contain" />
                                            ) : previews.aadhaarBack ? (
                                                <img src={previews.aadhaarBack} alt="Aadhaar Back Preview" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-gray-400 text-3xl">+</span>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                            {
                                shipperData?.verificationStatus === 'pending' ? <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                >
                                    Submit KYC
                                </button> :
                                    ''
                            }


                        </form>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Profile;
