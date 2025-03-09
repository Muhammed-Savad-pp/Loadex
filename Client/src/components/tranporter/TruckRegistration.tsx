import React, { useState } from 'react';
import { FaLocationDot } from "react-icons/fa6";
import { registerTruck } from '../../services/transporter/transporterApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { validateTruckForm } from '../../validations/truckValidation';

interface FormDataType {
    vehicleNumber: string;
    ownerName: string;
    ownerMobileNo: string;
    type: string;
    capacity: string;
    tyres: string;
    driverName: string;
    driverMobileNumber: string;
    currentLocation: string;
    from: string;
    to: string;
    selectedLocations: string[];
}



const VehicleRegistration = () => {

    const navigate = useNavigate()

    const [formData, setFormData] = useState<FormDataType>({
        vehicleNumber: '',
        ownerName: '',
        ownerMobileNo: '',
        type: '',
        capacity: '',
        tyres: '',
        driverName: '',
        driverMobileNumber: '',
        currentLocation: '',
        from: '',
        to: '',
        selectedLocations: [],
    });

    const [formError, setFormError] = useState<Partial<FormDataType>>({});



    const [uploadedDocuments, setUploadedDocuments] = useState({
        rcBook: null,
        driverLicense: null
    });

    const [displayImage, setDisplayImage] = useState({
        rcBook: null,
        driverLicense: null,
    })



    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleDocumentUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {

            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file)

            setDisplayImage(prevState => ({
                ...prevState,
                [type]: imageUrl
            }))

            setUploadedDocuments(prevState => ({
                ...prevState,
                [type]: file
            }));


        }
    };

    const handleLocationToggle = (location: string) => {
        setFormData((prevState) => {
            let updatedLocations = [...(prevState.selectedLocations || [])];

            if (location === "All India permitted") {

                updatedLocations = updatedLocations.includes(location) ? [] : [location];

            } else {

                updatedLocations = updatedLocations.filter(loc => loc !== "All India permitted");

                if (updatedLocations.includes(location)) {
                    updatedLocations = updatedLocations.filter(loc => loc !== location);
                } else {
                    updatedLocations.push(location);
                }
            }

            return { ...prevState, selectedLocations: updatedLocations };
        });
    };


    const locations = [
        'All India permitted', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
        'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
        'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // console.log('Form Data:', formData);
        // console.log('Uploaded Documents:', uploadedDocuments);
        // // Submit logic here

        const validateErrors = validateTruckForm(formData);
        setFormError(validateErrors);

        if (Object.keys(validateErrors).length > 0) {
            toast.error('please fix the errors before submitting.')
            return;
        }

        try {

            const formDataToSend = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    if (key === 'selectedLocations') {
                        formDataToSend.append(key, JSON.stringify(value))
                    } else {
                        value.forEach((item) => formDataToSend.append(key, item));
                    }
                } else {
                    formDataToSend.append(key, value)
                }
            })

            if (uploadedDocuments.rcBook) {
                formDataToSend.append('rcBook', uploadedDocuments.rcBook);
            }

            if (uploadedDocuments.driverLicense) {
                formDataToSend.append('driverLicense', uploadedDocuments.driverLicense)
            }

            const response: any = await registerTruck(formDataToSend)

            if (!response.success) {

                toast.error(response.message)

            } else {

                setFormData({
                    vehicleNumber: '',
                    ownerName: '',
                    ownerMobileNo: '',
                    type: '',
                    capacity: '',
                    tyres: '',
                    driverName: '',
                    driverMobileNumber: '',
                    currentLocation: '',
                    from: '',
                    to: '',
                    selectedLocations: []
                })

                setDisplayImage({
                    rcBook: null,
                    driverLicense: null
                })

                toast.success(response.message)
            }


        } catch (error) {
            console.log(error)
        }
    };

    return (
        <div className="w-auto mx-auto p-4 bg-white">
            <h1 className="text-2xl font-bold text-center mb-6">Register Your Truck</h1>
            <div className='bg-gray-100 rounded-lg shadow-md'>
                <div className='p-5'>
                    <form onSubmit={handleSubmit} noValidate>
                        {/* Basic Details Section */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">Basic Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="mb-3">
                                    <label className="block text-sm mb-1">Vehicle Number</label>
                                    <input
                                        type="text"
                                        name="vehicleNumber"
                                        value={formData.vehicleNumber}
                                        onChange={handleInputChange}
                                        className={`w-full border border-gray-400 shadow-md rounded p-2 text-sm bg-white pl-1 ${formError.vehicleNumber ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {formError.vehicleNumber && <p className="text-red-500 text-sm mt-1">{formError.vehicleNumber}</p>}
                                </div>

                                <div className="mb-3">
                                    <label className="block text-sm mb-1">Owner Name</label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleInputChange}
                                        className={`w-full border border-gray-400 shadow-md rounded p-2 text-sm bg-white pl-1 ${formError.vehicleNumber ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {formError.ownerName && <p className="text-red-500 text-sm mt-1">{formError.ownerName}</p>}
                                </div>

                                <div className="mb-3">
                                    <label className="block text-sm mb-1">Owner Mobile No</label>
                                    <input
                                        type="text"
                                        name="ownerMobileNo"
                                        value={formData.ownerMobileNo}
                                        onChange={handleInputChange}
                                        className={`w-full border border-gray-400 shadow-md rounded p-2 text-sm bg-white pl-1 ${formError.ownerMobileNo ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {formError.ownerMobileNo && <p className="text-red-500 text-sm mt-1">{formError.ownerMobileNo}</p>}
                                </div>

                                <div className="mb-3">
                                    <label className="block text-sm mb-1">Type</label>
                                    <input
                                        type="text"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className={`w-full border border-gray-400 shadow-md rounded p-2 text-sm bg-white pl-1 ${formError.type ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {formError.type && <p className="text-red-500 text-sm mt-1">{formError.type}</p>}
                                </div>

                                <div className="mb-3">
                                    <label className="block text-sm mb-1">Capacity</label>
                                    <input
                                        type="text"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        className={`w-full border border-gray-400 shadow-md rounded p-2 text-sm bg-white pl-1 ${formError.capacity ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {formError.capacity && <p className="text-red-500 text-sm mt-1">{formError.capacity}</p>}
                                </div>



                                <div className="mb-3">
                                    <label className="block text-sm mb-1">Tyres</label>
                                    <input
                                        type="text"
                                        name="tyres"
                                        value={formData.tyres}
                                        onChange={handleInputChange}
                                        className={`w-full border border-gray-400 shadow-md rounded p-2 text-sm bg-white pl-1 ${formError.tyres ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {formError.tyres && <p className="text-red-500 text-sm mt-1">{formError.tyres}</p>}
                                </div>

                                <div className="mb-3">
                                    <label className="block text-sm mb-1">Driver Name</label>
                                    <input
                                        type="text"
                                        name="driverName"
                                        value={formData.driverName}
                                        onChange={handleInputChange}
                                        className={`w-full border border-gray-400 shadow-md rounded p-2 text-sm bg-white pl-1 ${formError.driverName ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {formError.driverName && <p className="text-red-500 text-sm mt-1">{formError.driverName}</p>}
                                </div>

                                <div className="mb-3">
                                    <label className="block text-sm mb-1">Driver Mobile Number</label>
                                    <input
                                        type="text"
                                        name="driverMobileNumber"
                                        value={formData.driverMobileNumber}
                                        onChange={handleInputChange}
                                        className={`w-full border border-gray-400 shadow-md rounded p-2 text-sm bg-white pl-1 ${formError.driverMobileNumber ? 'border-red-500' : ''}`}
                                        required
                                    />
                                    {formError.driverMobileNumber && <p className="text-red-500 text-sm mt-1">{formError.driverMobileNumber}</p>}
                                </div>

                                <div className="mb-3">
                                    <label className="block text-sm mb-1">Current Location</label>
                                    <div className="relative">
                                        <FaLocationDot className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="currentLocation"
                                            value={formData.currentLocation}
                                            onChange={handleInputChange}
                                            className={`w-full border border-gray-400 shadow-md rounded p-2 text-sm bg-white pl-10 ${formError.currentLocation ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {formError.currentLocation && <p className="text-red-500 text-sm mt-1 absolute left-0 top-full">{formError.currentLocation}</p>}
                                    </div>
                                </div>


                                <div className="mb-3">
                                    <label className="block text-sm mb-1">From</label>
                                    <div className='relative'>
                                        <FaLocationDot className="absolute top-1/2 left-3 transform -translate-y-1/2 text-green-500" />
                                        <input
                                            type="text"
                                            name="from"
                                            value={formData.from}
                                            onChange={handleInputChange}
                                            className={`w-full border border-gray-400 shadow-md rounded p-2 text-sm bg-white pl-10 ${formError.from ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {formError.from && <p className="text-red-500 text-sm mt-1 absolute left-0 top-full">{formError.from}</p>}
                                    </div>

                                </div>

                                <div className="mb-3">
                                    <label className="block text-sm mb-1">To</label>
                                    <div className='relative'>
                                        <FaLocationDot className="absolute top-1/2 left-3 transform -translate-y-1/2 text-red-600" />
                                        <input
                                            type="text"
                                            name="to"
                                            value={formData.to}
                                            onChange={handleInputChange}
                                            className={`w-full border border-gray-400 shadow-md rounded p-2 text-sm bg-white pl-10 ${formError.to ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {formError.to && <p className="text-red-500 text-sm mt-1 absolute left-0 top-full">{formError.to}</p>}
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Manage Document Section */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">Manage Document</h2>

                            <div className="grid grid-cols-2 gap-6">
                                {/* RC Book Upload */}
                                <div className="border-dashed border-2 border-gray-500 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400">
                                    <p className="text-black text-md mb-2">Upload RC Book</p>
                                    <label className="cursor-pointer w-full">
                                        <input
                                            type="file"
                                            id="rcBook"
                                            className="hidden"
                                            onChange={(e) => handleDocumentUpload('rcBook', e)}
                                            accept="image/*"
                                        />
                                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-md shadow overflow-hidden">
                                            {displayImage.rcBook ? (
                                                <img src={displayImage.rcBook} alt="RC Book" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-gray-400 text-3xl">+</span>
                                            )}
                                        </div>
                                    </label>
                                </div>

                                {/* Driver Photo Upload */}
                                <div className="border-dashed border-2 border-gray-500 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400">
                                    <p className="text-black text-md  mb-2">Upload Driver License</p>
                                    <label className="cursor-pointer w-full">
                                        <input
                                            type="file"
                                            id="driverLicense"
                                            className="hidden"
                                            onChange={(e) => handleDocumentUpload('driverLicense', e)}
                                            accept="image/*"
                                        />
                                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-md shadow overflow-hidden">
                                            {displayImage.driverLicense ? (
                                                <img src={displayImage.driverLicense} alt="driverLicence" className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-gray-400 text-3xl">+</span>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">Locations</h2>
                            {formError.selectedLocations && <p className="text-red-500 text-sm mt-1">{formError.selectedLocations}</p>}


                            {/* All India Permit Checkbox */}
                            <div className="flex items-center mb-4 mt-3">
                                <input
                                    type="checkbox"
                                    id="all-india-permit"
                                    checked={formData.selectedLocations.includes("All India permitted")}
                                    onChange={() => handleLocationToggle("All India permitted")}
                                    className="mr-2"
                                />
                                <label
                                    htmlFor="all-india-permit"
                                    className={`px-3 py-1 rounded-sm text-md cursor-pointer ${formData.selectedLocations.includes("All India permitted")
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-700"
                                        }`}
                                >
                                    All India permitted
                                </label>
                            </div>

                            {/* Other Locations */}
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                {locations.filter(loc => loc !== "All India permitted").map((location, index) => (
                                    <div key={index} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`location-${index}`}
                                            checked={formData.selectedLocations.includes(location)}
                                            onChange={() => handleLocationToggle(location)}
                                            className="mr-2"
                                            disabled={formData.selectedLocations.includes("All India permitted")}
                                        />
                                        <label
                                            htmlFor={`location-${index}`}
                                            className={`px-3 py-1 rounded-sm text-sm cursor-pointer ${formData.selectedLocations.includes(location)
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-700"
                                                }`}
                                        >
                                            {location}
                                        </label>
                                    </div>
                                ))}
                              
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VehicleRegistration;