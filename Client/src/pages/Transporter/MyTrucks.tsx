import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../../components/Common/Navbar/Navbar";
import ProfileSidebar from "../../components/tranporter/ProfileSidebar";
import { fetchTrucks, activateTruck } from "../../services/transporter/transporterApi";
import toast from "react-hot-toast";
import { debounce } from "lodash";
const MAP_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
import { MapPinIcon } from '@heroicons/react/24/outline';
import { useNavigate } from "react-router-dom";




interface TruckData {
  _id: string;
  available: boolean;
  currentLocation: string;
  driverMobileNo: string;
  driverName: string;
  dropLocation: number;
  operatingStates: string[];
  pickupLocation: string;
  truckNo: string;
  truckOwnerMobileNo: string;
  truckOwnerName: string;
  truckType: string;
  tyres: string;
  verificationStatus: string;
  capacity: string;
  driverLicense: string
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

interface FormDataType {
  driverName: string;
  driverMobileNo: string;
  currentLocation: string;
  currentLocationCordinates: {
    latitude: number;
    longitude: number;
  };
  licenseImage: File | null | string;
}

const MyTrucks: React.FC = () => {

  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'Active' | 'InActive'>('Active');
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectTruckActive, setSelectTruckActive] = useState<TruckData | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([])
  const [currentLocation, setCurrentLocation] = useState(selectTruckActive?.currentLocation);
  const [isCurrentLocationDropdown, setIsCurrentLocationDropdown] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormDataType>({
    driverName: selectTruckActive?.driverName || '',
    driverMobileNo: selectTruckActive?.driverMobileNo || '',
    currentLocation: selectTruckActive?.currentLocation || '',
    currentLocationCordinates: {
      latitude: 0,
      longitude: 0,
    },
    licenseImage: selectTruckActive?.driverLicense || null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof formData.licenseImage === 'string' ? formData.licenseImage : null
  );
  const [formError, setFormError] = useState<Partial<FormDataType>>()

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectTruckActive) {
      setFormData({
        driverName: selectTruckActive.driverName || '',
        driverMobileNo: selectTruckActive.driverMobileNo || '',
        currentLocation: selectTruckActive.currentLocation || '',
        currentLocationCordinates: {
          latitude: 0,
          longitude: 0,
        },
        licenseImage: selectTruckActive.driverLicense || null,
      });

      setImagePreview(selectTruckActive.driverLicense || null)
    }
  }, [selectTruckActive])

  useEffect(() => {
    const findTrucks = async () => {
      try {
        setLoading(true);
        const response = await fetchTrucks();
        setTrucks(response as TruckData[]);
      } catch (error) {
        console.error("Failed to fetch trucks:", error);
      } finally {
        setLoading(false);
      }
    };

    findTrucks();
  }, []);

  const filteredTrucks = trucks.filter(truck =>
    (activeTab === 'Active' && truck.available && truck.verificationStatus === 'approved') ||
    (activeTab === 'InActive' && !truck.available)
  );

  const onClose = () => {
    setSelectTruckActive(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setFormData(prev => ({ ...prev, licenseImage: file })); // Store as File

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string); // Preview new image
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }


  const debouncedSearch = useCallback(
    debounce(async (search) => {

      fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${search}&apiKey=${MAP_API_KEY}`)
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


  const handleCurrentSelectedLocation = (location: Location) => {
    const fullAddress = `${location.properties.address_line1} ${location.properties.state_district || ''} ${location.properties.state} ${location.properties.country}`;

    setCurrentLocation(fullAddress);
    setFormData({
      ...formData,
      currentLocation: fullAddress,
      currentLocationCordinates: {
        latitude: location.geometry.coordinates[0],
        longitude: location.geometry.coordinates[1]
      }
    })

    setIsCurrentLocationDropdown(false)

  }

  const handleCurrentLocationSearch = (value: string) => {

    setCurrentLocation(value)
    debouncedSearch(value)
    setIsCurrentLocationDropdown(true)

  }

  const validateFrom = (form: FormDataType) => {

    const errors: Partial<FormDataType> = {};

    if (!form.driverName.trim()) errors.driverName = 'Driver Name is required';
    if (!form.driverMobileNo.trim()) errors.driverMobileNo = 'Driver Mobile is required';
    if (!form.currentLocation.trim()) errors.currentLocation = 'Current Location is required'


    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.driverMobileNo)) errors.driverMobileNo = "Enter a valid 10-digit mobile number.";

    return errors

  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validateErrors = validateFrom(formData);
    setFormError(validateErrors)

    if (Object.keys(validateErrors).length > 0) {
      toast.error('Please fix this error');
      return
    }

    const formDataToSend = new FormData();

    formDataToSend.append('driverName', formData.driverName);
    formDataToSend.append('driverMobileNo', formData.driverMobileNo);
    formDataToSend.append('currentLocation', formData.currentLocation)
    formDataToSend.append(
      'currentLocationCordinates',
      JSON.stringify(formData.currentLocationCordinates ?? { latitude: 0, longitude: 0 })
    );


    if (selectTruckActive?._id) {
      formDataToSend.append('id', selectTruckActive._id);
    }


    if (formData.licenseImage instanceof File) {
      formDataToSend.append('driverLicenseFile', formData.licenseImage);
    } else if (typeof formData.licenseImage === 'string') {
      formDataToSend.append('driverLicense', formData.licenseImage);
    }


    try {

      const response: any = await activateTruck(formDataToSend);

      if(response.success) {

        toast.success(response.message)
        setSelectTruckActive(null);

      }

    } catch (error) {
      console.log(error);

    }

  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-100">
        <ProfileSidebar />

        <div className="flex-1 p-4 bg-gray-100">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h1 className="text-2xl font-bold text-center border-b pb-2 mb-4">My Trucks</h1>

            <div className="flex mb-4">
              <button
                className={`flex-1 py-2 ${activeTab === 'Active' ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-l-lg font-semibold`}
                onClick={() => setActiveTab('Active')}
              >
                Active
              </button>
              <button
                className={`flex-1 py-2 ${activeTab === 'InActive' ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-700'} rounded-r-lg font-semibold`}
                onClick={() => setActiveTab('InActive')}
              >
                InActive
              </button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 mx-auto animate-spin"></div>
                <p className="mt-2 text-gray-600">Loading trucks...</p>
              </div>
            )}

            {/* Truck listings */}
            <div className="space-y-4">
              {!loading && filteredTrucks.map(truck => (
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left column with truck details */}
                    <div className="flex-1 space-y-4">
                      {/* Header with truck type and availability badge */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {truck.truckType.toUpperCase()}
                        </h3>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {truck.truckNo}
                        </h3>

                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${truck.verificationStatus === 'requested' ? 'bg-blue-600 text-white' : truck.verificationStatus == 'pending' ? 'bg-red-600 text-white' : 'bg-green-500 text-white'}`}>
                          {truck.verificationStatus}
                        </span>
                      </div>

                      {/* Truck specifications */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                          <span>Capacity: <strong>{truck.capacity}</strong></span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Tyres: <strong>{truck.tyres}</strong></span>
                        </div>
                      </div>

                      {/* Truck number and location */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center text-green-600 mt-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium">{truck.currentLocation}</span>
                        </div>
                      </div>

                      {/* Driver info - shown based on verification status */}
                      {truck.verificationStatus === "approved" && (
                        <div className="flex flex-wrap gap-6  ">
                          <div className="flex items-center text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Owner: <strong>{truck.truckOwnerName}</strong></span>
                          </div>

                          <div className="flex items-center text-gray-700 ">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Driver: <strong>{truck.driverName}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {
                        truck.available ?

                          <button
                            onClick={() => navigate('/transporter/loadBoard')}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                          >
                            Find Loads
                          </button>
                          :
                          truck.verificationStatus === 'approved'
                            ?
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                              onClick={() => setSelectTruckActive(truck)}
                            >
                              Activate Truck
                            </button>
                            :
                            ''
                      }

                    </div>
                  </div>

                  {/* Operating states as tags */}
                  {truck.operatingStates && truck.operatingStates.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-600 mb-2">Operating States:</div>
                      <div className="text-sm text-blue-700 font-semibold">
                        {Array.isArray(truck.operatingStates) && typeof truck.operatingStates[0] === "string"
                          ? JSON.parse(truck.operatingStates[0]).join(", ")
                          : "N/A"}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {!loading && filteredTrucks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No {activeTab.toLowerCase()} trucks found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {selectTruckActive && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm backdrop-brightness-70">
          <div className="bg-white rounded-lg shadow-xl w-11/12 sm:w-4/5 md:w-3/4 lg:w-3/5 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Activate Truck</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-md font-medium text-gray-700 mb-3">Basic Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Driver Name</label>
                          <input
                            type="text"
                            name="driverName"
                            value={formData.driverName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter driver name"
                          />
                          {formError?.driverName && <p className="text-red-600 text-sm">{formError.driverName}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                          <input
                            type="text"
                            name="driverMobileNo"
                            value={formData.driverMobileNo}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter mobile number"
                          />
                          {formError?.driverMobileNo && <p className="text-red-600 text-sm">{formError.driverMobileNo}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-md font-medium text-gray-700 mb-3">Location</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Current Location</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            name="currentLocation"
                            value={currentLocation}
                            onChange={(e) => handleCurrentLocationSearch(e.target.value)}
                            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter current location"
                          />
                          {isCurrentLocationDropdown && locationSuggestions?.length > 0 && (
                            <div
                              className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto"
                            >
                              <ul className="py-1">
                                {locationSuggestions.map((location, index) => (
                                  <li
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                    onClick={() => handleCurrentSelectedLocation(location)}
                                  >
                                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    {`${location?.properties?.address_line1} ${location?.properties?.state_district || ''} ${location?.properties?.state} ${location?.properties?.country}`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* License Image Upload Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-md font-medium text-gray-700 mb-3">Driver's License</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Upload License Image</label>

                        {/* Hidden File Input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />

                        <div
                          onClick={triggerFileInput}
                          className={`relative cursor-pointer border-2 border-dashed rounded-lg p-4 transition-all
                                  ${imagePreview ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                        >
                          {imagePreview ? (
                            <div className="space-y-4">
                              <div className="relative w-full h-48 overflow-hidden rounded-lg">
                                <img
                                  src={imagePreview || (typeof formData.licenseImage === 'string' ? formData.licenseImage : '')}
                                  alt="License Preview"
                                  className="object-contain w-full h-full"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-green-600 font-medium">
                                  License image uploaded
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImagePreview(null);
                                    setFormData(prev => ({ ...prev, licenseImage: null }));
                                  }}
                                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
                                >
                                  Change
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-600 text-center mb-1">
                                Click to upload driver's license image
                              </p>
                              <p className="text-xs text-gray-500 text-center">
                                JPG, PNG or PDF up to 5MB
                              </p>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-gray-500">
                          Please ensure the license image is clear and all details are visible
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer / Actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}

                className={`px-6 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white `}
              >
                Activate Truck
              </button>
            </div>
          </div>
        </div>

      )}
    </>
  );
};

export default MyTrucks;