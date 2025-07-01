import React, { useState, ChangeEvent, useCallback } from 'react';
import { X, MapPin, Truck, Calendar, MapPinIcon, DollarSign, Package } from 'lucide-react';
import { LoadFormData } from '../../interface/interface';
const MAP_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
import { debounce } from 'lodash';

interface FormErrors {
  pickupLocation?: string;
  dropLocation?: string;
  quantity?: string;
  truckType?: string;
  scheduledDate?: string;
  transportationRent?: string;
  length?: string;
  breadth?: string;
  height?: string
}

interface LocationSuggestion {
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

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoad?: LoadFormData;
  onSubmit?: (data: LoadFormData) => void;
}

const UpdateLoadModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  selectedLoad,
  onSubmit
}) => {
  const [formData, setFormData] = useState<LoadFormData>(selectedLoad || {
    pickupLocation: '',
    dropLocation: '',
    material: '',
    quantity: '',
    truckType: '',
    scheduledDate: new Date(),
    transportationRent: '',
    length: '',
    breadth: '',
    height: '',
    descriptions: '',
  });

  const [formError, setFormError] = useState<FormErrors>({});
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isPickupDropdownOpen, setIsPickupDropdownOpen] = useState<boolean>(false);
  const [isDropDropdownOpen, setIsDropDropDownOpen] = useState<boolean>(false);
  const [includeConsignment, setIncludeConsignment] = useState<boolean>(false)

  const materials: string[] = ['Vegetable', 'Fruits', 'Grains', 'wood', 'Dairy', 'Metal', 'Other'];
  const vehicleTypes: string[] = ['Open Truck', 'Container', 'Refrigerated', 'Mini Truck', 'Tanker'];

  console.log(formData);


  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {


      fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${searchTerm}&apiKey=${MAP_API_KEY}`)
        .then(res => res.json())
        .then(result => {
          setLocationSuggestions(result.features || []);

        })
        .catch(error => {
          console.log('error', error)
          setLocationSuggestions([])
        });

    }, 1000),
    []
  );

  const handlePickupSearch = (query: string) => {
    setFormData(prev => ({ ...prev, pickupLocation: query }))
    setLocationSuggestions([])
    debouncedSearch(query);
    setIsPickupDropdownOpen(true);
  }

  const handleDropSerch = (query: string) => {
    setFormData(prev => ({ ...prev, dropLocation: query }))
    setLocationSuggestions([])
    debouncedSearch(query)
    setIsDropDropDownOpen(true);
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const handlePickupSelectLocation = (location: LocationSuggestion) => {
    const fullAddress = `${location.properties.address_line1} ${location.properties.state_district || ''} ${location.properties.state} ${location.properties.country}`;

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

  const handleDropSelectLocation = (location: LocationSuggestion) => {
    const fullAddress = `${location.properties.address_line1} ${location.properties.state_district || ''} ${location.properties.state} ${location.properties.country}`;

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

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.pickupLocation.trim()) {
      errors.pickupLocation = 'Pickup location is required';
    }

    if (!formData.dropLocation.trim()) {
      errors.dropLocation = 'Drop location is required';
    }

    if (!formData.quantity.trim()) {
      errors.quantity = 'Quantity is required';
    }

    if (!formData.truckType) {
      errors.truckType = 'Vehicle type is required';
    }

    if (!formData.scheduledDate) {
      errors.scheduledDate = 'Schedule date is required';
    }

    if (!formData.transportationRent.trim()) {
      errors.transportationRent = 'Transportation cost is required';
    }

    if (parseFloat(formData.transportationRent) < 0) {
      errors.transportationRent = "Negative value not required"
    }

    if (Number(formData.quantity) < 0) {
      errors.quantity = 'Negative Value not required'
    }

    if (Number(formData.length) < 0) {
      errors.length = 'Negative Value not required'
    }

    if (Number(formData.breadth) < 0) {
      errors.breadth = 'Negative Value not required'
    }

    if (Number(formData.height) < 0) {
      errors.height = 'Negative Value not required'
    }

    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (): void => {
    if (validateForm()) {
      if (onSubmit) {
        onSubmit(formData);
      }
    }
  };
  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  const RupeeIcon: React.FC = () => (
    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-opacity-30 backdrop-blur-sm transition-all"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Update Load</h2>
                <p className="text-sm text-gray-600 mt-1">Modify your Load details</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                type="button"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Pickup Location */}
                <div className="relative">
                  <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1 text-green-500" />
                    Pickup Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-green-500" />
                    </div>
                    <input
                      type="text"
                      id="pickupLocation"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={(e) => handlePickupSearch(e.target.value)}
                      className="pl-10 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-3 transition-all"
                      placeholder="Enter pickup location"
                    />
                  </div>
                  {formError?.pickupLocation && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      {formError.pickupLocation}
                    </p>
                  )}
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

                {/* Drop Location */}
                <div className="relative">
                  <label htmlFor="dropLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1 text-red-500" />
                    Delivery Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-red-500" />
                    </div>
                    <input
                      type="text"
                      id="dropLocation"
                      name="dropLocation"
                      value={formData.dropLocation}
                      onChange={(e) => handleDropSerch(e.target.value)}
                      className="pl-10 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-3 transition-all"
                      placeholder="Enter delivery location"
                    />
                  </div>
                  {formError?.dropLocation && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {formError.dropLocation}
                    </p>
                  )}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-2">
                      <Package className="inline h-4 w-4 mr-1 text-gray-600" />
                      Material
                    </label>
                    <select
                      id="material"
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-3 transition-all"
                    >
                      {materials.map((material) => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">(MT)</span>
                    </label>
                    <input
                      type="text"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="block w-full pl-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-3 transition-all"
                      placeholder="Enter quantity"
                    />
                    {formError?.quantity && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠</span>
                        {formError.quantity}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="truckType" className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="inline h-4 w-4 mr-1 text-gray-600" />
                    Select Vehicle Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Truck className="h-5 w-5 text-gray-600" />
                    </div>
                    <select
                      id="truckType"
                      name="truckType"
                      value={formData.truckType}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-3 transition-all"
                    >
                      <option value="" disabled>Select a vehicle type...</option>
                      {vehicleTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {formError?.truckType && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {formError.truckType}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1 text-blue-500" />
                    When do you want Truck?
                  </label>
                  <input
                    type="date"
                    id="scheduledDate"
                    name="scheduledDate"
                    value={formatDate(formData.scheduledDate)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledDate: new Date(e.target.value),
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pl-3 py-3 transition-all"
                  />

                  {formError?.scheduledDate && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {formError.scheduledDate}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="transportationRent" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1 text-green-600" />
                    Transportation Cost
                  </label>
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
                      className="pl-10 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 py-3 transition-all"
                      placeholder="Enter transportation cost"
                    />
                  </div>
                  {formError?.transportationRent && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {formError.transportationRent}
                    </p>
                  )}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <input
                      id="includeConsignment"
                      name="includeConsignment"
                      type="checkbox"
                      checked={includeConsignment}
                      onChange={() => setIncludeConsignment(!includeConsignment)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeConsignment" className="ml-3 block text-sm font-medium text-gray-700">
                      <Package className="inline h-4 w-4 mr-1 text-blue-600" />
                      Add CDC consignment
                    </label>
                  </div>
                </div>

                {/* Consignment Dimensions */}
                {includeConsignment && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Package Dimensions</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="length" className="block text-xs font-medium text-gray-600 mb-1">Length (L)</label>
                        <input
                          type="number"
                          id="length"
                          name="length"
                          value={formData.length}
                          onChange={handleChange}
                          className="block w-full pl-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 py-2 text-sm"
                          placeholder="cm"
                        />
                        {formError?.length && (
                          <p className="text-red-600 text-sm mt-1 flex items-center">
                            {formError.length}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="breadth" className="block text-xs font-medium text-gray-600 mb-1">Breadth (B)</label>
                        <input
                          type="number"
                          id="breadth"
                          name="breadth"
                          value={formData.breadth}
                          onChange={handleChange}
                          className="block w-full pl-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 py-2 text-sm"
                          placeholder="cm"
                        />
                        {formError?.breadth && (
                          <p className="text-red-600 text-sm mt-1 flex items-center">
                            {formError.breadth}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="height" className="block text-xs font-medium text-gray-600 mb-1">Height (H)</label>
                        <input
                          type="number"
                          id="height"
                          name="height"
                          value={formData.height}
                          onChange={handleChange}
                          className="block w-full pl-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 py-2 text-sm"
                          placeholder="cm"
                        />
                        {formError?.height && (
                          <p className="text-red-600 text-sm mt-1 flex items-center">
                            {formError.height}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="descriptions" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional comments <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">(optional)</span>
                  </label>
                  <textarea
                    id="descriptions"
                    name="descriptions"
                    value={formData.descriptions}
                    onChange={handleChange}
                    rows={includeConsignment ? 3 : 4}
                    className="block w-full pl-3 pt-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                    placeholder="Any special instructions or requirements..."
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 mt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium shadow-lg"
              >
                Update Load
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateLoadModal;