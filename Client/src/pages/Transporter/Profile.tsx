import React, { useEffect, useState } from "react";
import ProfileSidebar from "../../components/tranporter/ProfileSidebar";
import { getTransporterProfile, transporterKYCSubmit, updateProfile } from "../../services/transporter/transporterApi";
import Navbar from "../../components/Common/Navbar/Navbar";
import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
import toast from "react-hot-toast";
import profileImage from '../../assets/307ce493-b254-4b2d-8ba4-d12c080d6651.jpg'


interface TransporterData {
    transporterName: string;
    email: string;
    phone: string;
    verificationStatus?: string,
    panNumber?: string,
    aadhaarFront?: string,
    aadhaarBack?: string,
    profileImage?: string,
}

interface KYCData {
    panNumber: string;
    aadhaarFront: File | null;
    aadhaarBack: File | null;
}

interface IFormData {
    name: string;
    phone: string;
    profileImage: File | null | string,
}

const statusStyles: Record<string, string> = {
    pending: "bg-amber-200 text-amber-700 border-amber-300",
    requested: "bg-blue-200 text-blue-700 border-blue-300",
    rejected: "bg-red-200 text-red-700 border-red-300",
    approved: "bg-green-200 text-green-700 border-green-300"
};


const Profile = () => {

    const [transporterData, setTransporterData] = useState<TransporterData | null>(null)
    const [panError, setPanError] = useState({ panNumber: '' })
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<IFormData>({
        name: "",
        phone: "",
        profileImage: "",
    });
    const [kycData, setKycData] = useState<KYCData>({
        panNumber: '',
        aadhaarFront: null,
        aadhaarBack: null,
    });
    const [previews, setPreviews] = useState({
        aadhaarFront: '',
        aadhaarBack: ''
    });
    const [profileImagePreview, setProfileImagePreview] = useState('')
    const [profileDataError, setProfileDataError] = useState({
        name: '',
        phone: '',
    })

    useEffect(() => {
        if (transporterData) {
            setKycData({
                panNumber: transporterData.panNumber || '',
                aadhaarFront: null,
                aadhaarBack: null
            })
        }

    }, [transporterData])

    useEffect(() => {
        const getProfileData = async () => {

            const response: any = await getTransporterProfile()
            console.log(response, 'response');
            
            if (response.success) {
                setTransporterData(response.transporterData)
            }
        }
        getProfileData()
    }, [])

    useEffect(() => {

        if (transporterData) {
            setFormData({
                name: transporterData.transporterName || "",
                phone: transporterData.phone || "",
                profileImage: transporterData.profileImage || null
            })
        }

    }, [transporterData])

    useEffect(() => {
        return () => {
            if (previews.aadhaarFront) URL.revokeObjectURL(previews.aadhaarFront);
            if (previews.aadhaarBack) URL.revokeObjectURL(previews.aadhaarBack);
        };
    }, [previews]);

    useEffect(() => {
        return () => {
            if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
        }
    }, [profileImagePreview])



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



    const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKycData({ ...kycData, panNumber: e.target.value });
    };

    const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const previewProfileImageURl = URL.createObjectURL(file);
            setProfileImagePreview(previewProfileImageURl);

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

    const validation = (panNumber: string) => {

        const errors = {
            panNumber: ''
        };

        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
        const panErrors: string[] = [];

        if (!panNumber?.trim()) errors.panNumber = 'PanCard is required';

        if (!panRegex.test(panNumber ?? '')) {
            panErrors.push("First 5 characters must be uppercase letters (A-Z).");
            panErrors.push("Next 4 characters must be numbers (0-9).");
            panErrors.push("Last character must be an uppercase letter (A-Z).");
        }

        if (panErrors.length > 0) {
            errors.panNumber = panErrors.join('|');
        }

        return errors;
    };


    const handleKYCSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validation(kycData.panNumber);

        setPanError(validationError)

        const hasErrors = Object.values(validationError).some(error => error.trim() !== '');

        if (hasErrors) {
            toast.error('Please Fix this Error');
            return;
        }

        const formData = new FormData();
        formData.append('panNumber', kycData.panNumber);
        if (kycData.aadhaarFront) {
            formData.append('aadhaarFront', kycData.aadhaarFront);
        }

        if (kycData.aadhaarBack) {
            formData.append('aadhaarBack', kycData.aadhaarBack);
        }

        try {
            const response: any = await transporterKYCSubmit(formData);

            if (response.success) {
                setTransporterData((prev) => ({
                    ...prev,
                    panNumber: response.transporterData.panNumber,
                    aadhaarFront: response.transporterData.aadhaarFront,
                    aadhaarBack: response.transporterData.aadhaarBack,
                    verificationStatus: response.transporterData.verificationStatus,
                    transporterName: prev?.transporterName ?? '', // Ensure required fields are not undefined
                    email: prev?.email ?? '',
                    phone: prev?.phone ?? ''
                }))
                toast.success(response.message);
                
            } else {
                toast.error(response.message)
            }

        } catch (error) {
            console.error('Error submitting KYC data:', error);
        }
    };

    const validationForProfileData = (formData: Partial<IFormData>) => {
        const errors = {
            name: '',
            phone: ''
        }

        const phoneRegex = /^\d{10}$/;

        if (!formData.phone?.trim()) errors.phone = 'Phone Number is Required.'
        if (!formData.name?.trim()) errors.name = 'Transporter Name is Required.'
        if (formData.phone && !phoneRegex.test(formData.phone)) errors.phone = 'Phone Number is 10 digits.';

        return errors;
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validationForProfileData(formData);
        setProfileDataError(validationError);

        const hasError = Object.values(validationError).some(error => error.trim() !== '');
        if (hasError) {
            toast.error('Please Fix Error')
            return;
        }

        const formDataForSend = new FormData();

        formDataForSend.append('name', formData.name);
        formDataForSend.append('phone', formData.phone);
        if (formData.profileImage) {
            formDataForSend.append('profileImage', formData.profileImage);
        };

        try {

            const response: any = await updateProfile(formDataForSend);
            if (response.success) {

                setIsEditing(!isEditing)
                toast.success(response.message)

                setTransporterData((prev) => ({
                    ...prev,
                    transporterName: response.transporterData.transporterName,
                    email: response.transporterData.email,
                    phone: response.transporterData.phone,
                    profileImage: response.transporterData.profileImage,
                }))
            } else {
                toast.error(response.message);
            }

        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen bg-gray-100 mt-10">
                <ProfileSidebar />
                <div className="flex-grow flex flex-col justify-center p-10 space-y-6">
                    <div className="bg-white p-8 rounded-lg shadow-md w-full h-100">
                        <div className="flex flex-col items-center">
                            <label className="cursor-pointer">
                                <input type="file" className="hidden" accept="image/*" disabled={!isEditing} onChange={handleProfileFileChange} />
                                {
                                    profileImagePreview ? (
                                        <img src={profileImagePreview} alt="preview" className="w-24 h-24 rounded-full mb-4 bg-sky-200" />
                                    ) : transporterData?.profileImage ? (
                                        <img src={transporterData.profileImage} alt="ProfileImage" className="w-24 h-24 rounded-full mb-4 bg-sky-200" />
                                    ) :
                                        <img
                                            src={profileImage}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full bg-sky-200 mb-4"
                                        />
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

                                <div className="relative">
                                    <p className="text-gray-600 font-bold mb-1">Email</p>
                                    <div className="flex items-center rounded-md px-3 py-2 bg-gray-100  shadow-lg focus-within:ring-2 focus-within:ring-blue-400">
                                        <FaEnvelope className="text-gray-400 mr-2" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={transporterData?.email}
                                            onChange={handleChange}
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
                                {profileDataError.phone && <p className="text-sm text-red-600 mt-1">{profileDataError.phone}</p>}
                            </div>

                            <div className="flex justify-between mt-4">
                                {
                                    isEditing ?
                                        <button
                                            onClick={handleProfileUpdate}
                                            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 shadow-md transition">
                                            Save
                                        </button>
                                        :
                                        <button
                                            onClick={toggleEdit}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-5 p-2 rounded-md hover:bg-blue-700 shadow-md transition">
                                            Edit
                                        </button>
                                }


                                {/* Change Password Button */}
                                {/* <button className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2 rounded-md hover:bg-gray-800 shadow-md transition">
                                    <FaLock className="text-white" />
                                    Change Password
                                </button> */}
                            </div>
                        </div>

                    </div>



                    <div className="bg-white p-6 rounded-lg shadow-md w-full">
                        <form onSubmit={handleKYCSubmit}>
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-semibold text-gray-700">KYC Verification</h3>

                                {transporterData?.verificationStatus && (
                                    <div
                                        className={`px-3 py-0.5 rounded-full text-sm font-medium shadow-md border
                                            ${statusStyles[transporterData.verificationStatus] || "bg-gray-200 text-gray-700 border-gray-300"}`}
                                    >
                                        {transporterData.verificationStatus.charAt(0).toUpperCase() + transporterData.verificationStatus.slice(1)}
                                    </div>
                                )}
                            </div>



                            <div className="mb-5 w-80 mt-3">
                                <label className="text-gray-600 block mb-1 font-bold">PAN Number</label>
                                <input
                                    type="text"
                                    placeholder="Ex:- PQRSX5678K"
                                    value={kycData.panNumber}
                                    onChange={handlePanChange}
                                    readOnly={!['pending', 'rejected'].includes(transporterData?.verificationStatus || '')}
                                    className="w-full shadow-lg  px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 outline-none bg-gray-100 text-gray-700 placeholder-gray-400"
                                />
                                {panError.panNumber && (
                                    <div className="bg-red-50 border-l-4 border-red-600 p-2 mt-1 rounded-md">
                                        <ul className="text-red-600 text-xs list-disc pl-5 space-y-1">
                                            {panError.panNumber.split('|').map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-4">
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
                                            {previews.aadhaarFront ? (
                                                <img src={previews.aadhaarFront} alt="Preview Aadhaar Front" className="..." />
                                            ) : transporterData?.aadhaarFront ? (
                                                <img src={transporterData.aadhaarFront} alt="Aadhaar Front" className="..." />
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
                                            {previews?.aadhaarBack ? (
                                                <img src={previews.aadhaarBack} alt="Aadhaar Back" className="w-full h-full object-contain" />
                                            ) : transporterData?.aadhaarBack ? (
                                                <img src={transporterData?.aadhaarBack} alt="Aadhaar Back Preview" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-gray-400 text-3xl">+</span>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                            {
                                transporterData?.verificationStatus === 'pending' || transporterData?.verificationStatus === 'rejected' ? <button
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
