import React, { useState, useCallback, useRef } from 'react';
import { TruckIcon, MapPinIcon, } from '@heroicons/react/24/outline';
import { postLoad } from '../../services/shipper/shipperService';
import toast from 'react-hot-toast';
import Navbar from '../../components/Common/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { debounce } from "lodash"
const MAP_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;


export interface IFormData {
    pickupLocation: string;
    dropLocation: string;
    pickupCoordinates?: {
        latitude: number;
        longitude: number;
    };
    dropCoordinates?: {
        latitude: number;
        longitude: number;
    };
    material: string;
    quantity: string;
    scheduledDate: string;
    truckType: string;
    transportationRent: string;
    length: string;
    breadth: string;
    height: string;
    includeConsignment: boolean;
    discriptions: string;
}

interface Location {
    properties: {
        address_line1: string;
        state_district: string;
        state: string;
        country: string;
    };

    geometry: {
        coordinates: [number, number];
    }
}

interface IResponse {
    success: boolean,
    message: string,
}

const PostLoad: React.FC = () => {

    const navigate = useNavigate()
    const [pickupLocation, setPickupLocation] = useState<string>('');
    const [dropLocation, setDropLocation] = useState<string>('');
    const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([]);
    const [isPickupDropdownOpen, setIsPickupDropdownOpen] = useState(false);
    const [isDropDropdownOpen, setIsDropDropDownOpen] = useState<boolean>(false)
    // const dropdownRef = useRef(null);

    const [formData, setFormData] = useState<IFormData>({
        pickupLocation: '',
        dropLocation: '',
        material: 'Vegetable',
        quantity: '',
        scheduledDate: '',
        truckType: '',
        transportationRent: '',
        length: '',
        breadth: '',
        height: '',
        includeConsignment: false,
        discriptions: ''
    });

    const [formError, setFormError] = useState<Partial<IFormData>>()



    const debouncedSearch = useCallback(
        debounce(async (searchTerm) => {
            // console.log(`Fetching results for: ${searchTerm}`);
            // const response: any = await fetchAddress(searchTerm)

            fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${searchTerm}&apiKey=${MAP_API_KEY}`)
                .then(res => res.json())
                .then(result => {
                    setLocationSuggestions(result.features || []);

                })
                .catch(error => {
                    console.log('error', error)
                    setLocationSuggestions([])
                });

        }, 2000),
        []
    );

    console.log(locationSuggestions);


    const handlePickupSearch = (query: string) => {
        setPickupLocation(query);
        debouncedSearch(query);
        setIsPickupDropdownOpen(true);
    }

    const handleDropSerch = (query: string) => {
        setLocationSuggestions([])
        setDropLocation(query);
        debouncedSearch(query)
        setIsDropDropDownOpen(true);
    }

    const handlePickupSelectLocation = (location: Location) => {
        const fullAddress = `${location.properties.address_line1} ${location.properties.state_district || ''} ${location.properties.state} ${location.properties.country}`;

        setPickupLocation(fullAddress);
        setFormData({
            ...formData,
            pickupLocation: fullAddress,
            pickupCoordinates: {
                latitude: location.geometry.coordinates[1], // Latitude
                longitude: location.geometry.coordinates[0] // Longitude
            }
        });

        setIsPickupDropdownOpen(false);
    };

    const handleDropSelectLocation = (location: Location) => {
        const fullAddress = `${location.properties.address_line1} ${location.properties.state_district || ''} ${location.properties.state} ${location.properties.country}`;

        setDropLocation(fullAddress);
        setFormData({
            ...formData,
            dropLocation: fullAddress,
            dropCoordinates: {
                latitude: location.geometry.coordinates[1], // Latitude
                longitude: location.geometry.coordinates[0] // Longitude
            }
        });

        setIsDropDropDownOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {


        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const validation = (formData: Partial<IFormData> ) => {


        const errors: Partial<IFormData> = {}

        if(!formData.pickupLocation?.trim()) errors.pickupLocation = 'PickupLocation must be required';
        if(!formData.dropLocation?.trim()) errors.dropLocation = 'DropLocation must be required';
        if(!formData.material?.trim()) errors.material = 'Material must be required';
        if(!formData.quantity?.trim()) errors.quantity = 'Pickup must be required';
        if(!formData.scheduledDate?.trim()) errors.scheduledDate = 'Date must be required';
        if(!formData.truckType?.trim()) errors.truckType = 'Truck must be required';
        if(!formData.transportationRent?.trim()) errors.transportationRent = 'Transportation Cost must be required'


        return errors
         

    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {


        e.preventDefault();


        const validateForm = validation(formData)

        setFormError(validateForm)


        if(Object.keys(validateForm).length > 0) {

            toast.error('fix the error')
            return

        }
        console.log('Form submitted:', formData);
        try {

            const response = await postLoad(formData) as IResponse;

            if (response.success) {
                toast.success(response.message);
                navigate('/')
            } else {
                toast.error(response.message)
            }

        } catch (error) {
            console.error(error)
        }
    };

    const materials = ['Vegetable', 'Fruits', 'Grains', 'Dairy', 'Other'];
    const vehicleTypes = ['Open Truck', 'Container', 'Refrigerated', 'Mini Truck', 'Tanker'];

    const RupeeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h12M6 8h12M6 13l6 8M6 13h3c2 0 5-1 5-6" />
        </svg>
    );

    return (
        <>
            <Navbar />
            <div className="w-full h-screen bg-gray-50 flex  justify-center p-6">

                <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-6">
                    <h1 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-5">Post Load</h1>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-5">
                            {/* Location Section */}
                            <div className="space-y-4">
                                <div className='relative'>
                                    <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPinIcon className="h-5 w-5 text-green-500" />
                                        </div>
                                        <input
                                            type="text"
                                            id="pickupLocation"
                                            name="pickupLocation"
                                            value={pickupLocation}
                                            onChange={(e) => handlePickupSearch(e.target.value)}
                                            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2"
                                            placeholder="Pickup location"
                                        />
                                    </div>
                                    {formError?.pickupLocation && <p className='text-red-600 text-sm mt-1'>{formError?.pickupLocation}</p> }


                                    {isPickupDropdownOpen && locationSuggestions?.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                                            <ul className="py-1">
                                                {locationSuggestions.map((location, index) => (
                                                    <li
                                                        key={index}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                        onClick={() => handlePickupSelectLocation(location)}
                                                    >
                                                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                        {`${location?.properties?.address_line1} ${location?.properties?.state_district || ''} ${location?.properties?.state} ${location?.properties?.country}`}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}


                                </div>

                                <div>
                                    <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPinIcon className="h-5 w-5 text-red-500" />
                                        </div>
                                        <input
                                            type="text"
                                            id="dropLocation"
                                            name="dropLocation"
                                            value={dropLocation}
                                            onChange={(e) => handleDropSerch(e.target.value)}
                                            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2"
                                            placeholder="Delivery location"
                                        />

                                        {isDropDropdownOpen && locationSuggestions.length > 0 && (
                                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                                                <ul className="py-1">

                                                    {locationSuggestions.map((location, index) => (
                                                        <li
                                                            key={index}
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                            onClick={() => handleDropSelectLocation(location)}
                                                        >
                                                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                            {`${location?.properties?.address_line1} ${location?.properties?.state_district ? location?.properties?.state_district : ''} ${location?.properties?.state} ${location?.properties?.country}`}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    {formError?.dropLocation && <p className='text-sm text-red-600 mt-1'>{formError.dropLocation}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                                        <select
                                            id="material"
                                            name="material"
                                            value={formData.material}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2"
                                        >
                                            {materials.map((material) => (
                                                <option key={material} value={material}>{material}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantity <span className="text-xs text-gray-500">(MT)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="quantity"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2"

                                        />
                                        {formError?.quantity && <p className='text-sm text-red-600 mt-1'>{formError.quantity}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle Type</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <TruckIcon className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <select
                                            id="truckType"
                                            name="truckType"
                                            value={formData.truckType}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2"
                                        >
                                            <option value="" disabled>Select a vehicle type...</option>
                                            {vehicleTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {formError?.truckType && <p className='text-sm text-red-600 mt-1'>{formError.truckType}</p>}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">When do you want Truck?</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            id="scheduledDate"
                                            name="scheduledDate"
                                            value={formData.scheduledDate}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split("T")[0]}
                                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 py-2 pr-3"
                                        />

                                    </div>
                                    {formError?.scheduledDate && <p className='text-sm text-red-600 mt-1'>{formError.scheduledDate}</p>}
                                </div>

                                <div>
                                    <label htmlFor="transportationRent" className="block text-sm font-medium text-gray-700 mb-1">Transportation Cost</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <RupeeIcon />
                                        </div>
                                        <input
                                            type="number"
                                            id="transportationRent"
                                            name="transportationRent"
                                            value={formData.transportationRent}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2"
                                            placeholder="Enter transportation cost"
                                        />
                                    </div>
                                    {formError?.transportationRent && <p className='text-sm text-red-600 mt-1'>{formError.transportationRent}</p>}
                                </div>

                                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                    <input
                                        id="includeConsignment"
                                        name="includeConsignment"
                                        type="checkbox"
                                        checked={formData.includeConsignment}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="includeConsignment" className="ml-2 block text-sm font-medium text-gray-700">
                                        Add CDC consignment
                                    </label>
                                </div>

                                {formData.includeConsignment ? (
                                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">Length (L)</label>
                                            <input
                                                type="number"
                                                id="length"
                                                name="length"
                                                value={formData.length}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="breadth" className="block text-sm font-medium text-gray-700 mb-1">Breadth (B)</label>
                                            <input
                                                type="number"
                                                id="breadth"
                                                name="breadth"
                                                value={formData.breadth}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Height (H)</label>
                                            <input
                                                type="number"
                                                id="height"
                                                name="height"
                                                value={formData.height}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label htmlFor="additionalComments" className="block text-sm font-medium text-gray-700 mb-1">
                                            Additional comments <span className="text-xs text-gray-500">(optional)</span>
                                        </label>
                                        <textarea
                                            id="discriptions"
                                            name="discriptions"
                                            value={formData.discriptions}
                                            onChange={handleChange}
                                            rows={4}
                                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Any special instructions or requirements..."
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Comments section shown in different position when consignment is enabled */}
                            {formData.includeConsignment && (
                                <div className="col-span-2">
                                    <label htmlFor="additionalComments" className="block text-sm font-medium text-gray-700 mb-1">
                                        Additional comments <span className="text-xs text-gray-500">(optional)</span>
                                    </label>
                                    <textarea
                                        id="discriptions"
                                        name="discriptions"
                                        value={formData.discriptions}
                                        onChange={handleChange}
                                        rows={2}
                                        className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Any special instructions or requirements..."
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="col-span-2 flex justify-end mt-2">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>

    );
};

export default PostLoad;