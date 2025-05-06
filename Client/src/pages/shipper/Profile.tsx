import React, { useEffect, useState } from "react";
import ShipperProfileSidebar from "../../components/shipper/ShipperProfileSidebar";
import Navbar from "../../components/Common/Navbar/Navbar";
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";
import { getShipperProfile, shipperKycSumbit, updateProfile } from "../../services/shipper/shipperService";
import toast from "react-hot-toast";

interface Shipperdata {
    shipperName: string;
    email: string;
    phone: string;
    verificationStatus?: string;
    panNumber?: string;
    aadhaarFront?: string;
    aadhaarBack?: string;
    companyName?: string;
    gstNumber?: string;
    profileImage?: string
}

interface KYCData {
    companyName: string;
    panNumber: string;
    gstNumber: string
    aadhaarFront: File | null;
    aadhaarBack: File | null;
}

interface IResponse {
    success: boolean,
    message: string,
    shipperData: Shipperdata
}

interface IFormData {
    name: string;
    email: string;
    phone: string;
    profileImage: File | null | string
}

const statusStyles: Record<string, string> = {
    pending: "bg-amber-200 text-amber-700 border-amber-300",
    requested: "bg-blue-200 text-blue-700 border-blue-300",
    rejected: "bg-red-200 text-red-700 border-red-300",
    approved: "bg-green-200 text-green-700 border-green-300"
};


const Profile = () => {

    const [shipperData, setShipperData] = useState<Shipperdata | null>(null)
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<IFormData>({
        name: "",
        email: "",
        phone: "",
        profileImage: null,
    });

    console.log(formData, 'formData');


    const [kycData, setKycData] = useState<KYCData>({
        companyName: '',
        gstNumber: '',
        panNumber: '',
        aadhaarFront: null,
        aadhaarBack: null,
    });

    const [previews, setPreviews] = useState({
        aadhaarFront: '',
        aadhaarBack: ''
    });

    const [profileImagePreviews, setProfileImagePreviews] = useState('')

    const [kycError, setKycError] = useState({
        companyName: '',
        gstNumber: '',
        panNumber: ''
    })

    const [profileDataError, setProfileDataError] = useState({
        name: '',
        phone: ''
    })

    console.log(shipperData, 'shipperData');


    useEffect(() => {
        const getProfileData = async () => {

            const response = await getShipperProfile() as IResponse;
            if (response.success) {
                setShipperData(response.shipperData)
            }
        }
        getProfileData()
    }, [])

    useEffect(() => {

        if (shipperData) {
            setFormData({
                name: shipperData.shipperName || "",
                email: shipperData.email || "",
                phone: shipperData.phone || "",
                profileImage: shipperData.profileImage || null,
            })
        }

    }, [shipperData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKycData({ ...kycData, [e.target.name]: e.target.value });
    };

    const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const file = e.target.files?.[0];

        console.log(file, 'filee');

        if (file) {
            const previewProfileImageUrl = URL.createObjectURL(file);
            setProfileImagePreviews(previewProfileImageUrl)

            setFormData(prev => ({
                ...prev,
                profileImage: file
            }))
        }

    }

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


    useEffect(() => {
        return () => {
            if (profileImagePreviews) URL.revokeObjectURL(profileImagePreviews);
        }
    }, [profileImagePreviews]);

    const validation = (kycData: Partial<KYCData>) => {
        const errors = {
            companyName: '',
            gstNumber: '',
            panNumber: ''
        };

        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
        const panErrors: string[] = [];
        const gstErrors: string[] = [];

        if (!kycData.panNumber?.trim()) errors.panNumber = 'PanCard is required';
        if (!kycData.companyName?.trim()) errors.companyName = 'Company is required';
        if (!kycData.gstNumber?.trim()) errors.gstNumber = 'GST Number is required';

        if (!panRegex.test(kycData.panNumber ?? '')) {
            panErrors.push("First 5 characters must be uppercase letters (A-Z).");
            panErrors.push("Next 4 characters must be numbers (0-9).");
            panErrors.push("Last character must be an uppercase letter (A-Z).");
        }

        if (panErrors.length > 0) {
            errors.panNumber = panErrors.join('|');
        }

        if (!/^[0-3][0-9]/.test(kycData.gstNumber ?? '')) {
            gstErrors.push("First 2 characters must be a numeric state code (01-35).");
        }

        if (!/^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]/.test(kycData.gstNumber ?? '')) {
            gstErrors.push("Next 10 characters must be a valid PAN number (ABCDE1234F).");
        }

        if (!/^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]/.test(kycData.gstNumber ?? '')) {
            gstErrors.push("13th character must be an entity code (1-9 or A-Z).");
        }

        if (!/^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z]/.test(kycData.gstNumber ?? '')) {
            gstErrors.push("14th character must be a checksum digit (A-Z or 0-9).");
        }

        if (!/^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$/.test(kycData.gstNumber ?? '')) {
            gstErrors.push("15th character must be a check digit (0-9 or A-Z).");
        }

        if (gstErrors.length > 0) {
            errors.gstNumber = gstErrors.join('|')
        }

        return errors;
    };


    const handleKYCSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validation(kycData);

        setKycError(validationError);

        const hasErrors = Object.values(validationError).some(error => error.trim() !== '');

        if (hasErrors) {
            toast.error('Please Fix this Error');
            return;
        }

        // Create FormData object to handle file uploads
        const formData = new FormData();
        formData.append('companyName', kycData.companyName);
        formData.append('panNumber', kycData.panNumber);
        formData.append('gstNumber', kycData.gstNumber);

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
                    phone: prev?.phone ?? '',
                    profileImage: prev?.profileImage ?? ''
                }))
            }

        } catch (error) {
            console.error('Error submitting KYC data:', error);
        }
    };

    const validationForProfileData = (formData: Partial<IFormData>) => {

        const errors = {
            phone: '',
            name: ''
        }

        const phoneRegex = /^\d{10}$/;

        if (!formData.phone?.trim()) errors.phone = 'Phone Number is Requried';
        if (!formData.name?.trim()) errors.name = 'Name is Requried'

        if (formData.phone && !phoneRegex.test(formData.phone)) errors.phone = "Phone Number is 10 digits"

        return errors

    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validationForProfileData(formData);

        setProfileDataError(validationError)

        const hasError = Object.values(validationError).some(error => error.trim() !== '');

        if (hasError) {
            toast.error('Please Fix this Error');
            return
        }

        const sendFormData = new FormData();

        sendFormData.append('name', formData.name);
        sendFormData.append('phone', formData.phone);
        if (formData.profileImage) {
            sendFormData.append('profileImage', formData.profileImage)
        }

        sendFormData.forEach((val, key) => {
            console.log(key, val)
        })

        try {

            const response: any = await updateProfile(sendFormData);
            console.log(response, 'response');

            if (response.success) {
                toast.success(response.message)

                setFormData((prev) => ({
                    ...prev,
                    name: response.shipperData.shipperName,
                    phone: response.shipperData.phone,
                    profileImage: response.shipperData.profileImage,
                }))
            } else {
                toast.error(response.message)
            }


        } catch (error) {
            console.log(error);

        }


        setIsEditing(!isEditing);


    }

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
                            <label className="cursor-pointer ">
                                <input className="hidden" type="file" accept="image/*" disabled={!isEditing} onChange={handleProfileFileChange} />
                                {
                                    profileImagePreviews ? (
                                        <img src={profileImagePreviews} alt="Preview" className="w-24 h-24 rounded-full mb-4 bg-sky-200" />
                                    ) : shipperData?.profileImage ? (
                                        <img src={shipperData.profileImage} alt="Profile Image" className="w-24 h-24 rounded-full mb-4 bg-sky-200" />
                                    ) : (
                                        <img
                                            src="/api/placeholder/100/100"
                                            alt="Placeholder"
                                            className="w-24 h-24 rounded-full bg-sky-200 mb-4"
                                        />
                                    )
                                }
                            </label>
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
                                            value={formData.name}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                            className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    {profileDataError.name && <p className="text-sm text-red-600 mt-1">{profileDataError.name}</p>}

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
                                            readOnly
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
                                        value={formData.phone}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                        className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
                                        placeholder="Enter your mobile number"
                                    />
                                </div>
                                {profileDataError.phone && <p className="text-sm text-red-600 ">{profileDataError.phone}</p>}
                            </div>

                            {/* Buttons Section */}
                            <div className="flex justify-between mt-4">
                                {/* Edit Button */}
                                {
                                    isEditing ?
                                        <button
                                            onClick={handleProfileUpdate}
                                            className=" flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 shadow-md transition">
                                            save
                                        </button>
                                        :
                                        <button
                                            onClick={toggleEdit}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 shadow-md transition">
                                            Edit
                                        </button>
                                }

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
                                        placeholder="Ex:- PQRSX5678K"
                                        className="w-full shadow-lg px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-500 placeholder-gray-400"
                                    />
                                    {kycError.panNumber && (
                                        <div className="bg-red-50 border-l-4 border-red-600 p-2 mt-1 rounded-md">
                                            <ul className="text-red-600 text-xs list-disc pl-5 space-y-1">
                                                {kycError.panNumber.split('|').map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="text-gray-600 block mb-1 font-bold">GST Number</label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={shipperData?.gstNumber || kycData.gstNumber}
                                        onChange={handleInputChange}
                                        readOnly={!!shipperData?.gstNumber}
                                        placeholder="Ex:-  12ABCDE1234F1Z5"
                                        className="w-full shadow-lg px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 text-gray-500 placeholder-gray-400"
                                    />
                                    {kycError.gstNumber && (
                                        <div className="bg-red-50 border-l-4 border-red-600 p-2 mt-1 rounded-md">
                                            <ul className="text-red-600 text-xs list-disc pl-5 space-y-1">
                                                {kycError.gstNumber.split('|').map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
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
                                </button> : ''
                            }
                        </form>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Profile;
