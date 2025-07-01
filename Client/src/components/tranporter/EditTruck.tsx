import React, { useState, useEffect } from 'react';

interface TruckData {
  _id?: string;
  available?: boolean;
  currentLocation?: string;
  driverMobileNo?: string;
  driverName?: string;
  dropLocation?: string;
  operatingStates: string[];
  pickupLocation?: string;
  truckNo?: string;
  truckOwnerMobileNo: string;
  truckOwnerName: string;
  truckType: string;
  tyres: string;
  verificationStatus?: string;
  capacity: string;
  driverLicense?: string;
  status?: string;
  truckImage: string;
  rcValidity: string;
}

interface EditTruckProps {
  initialData?: TruckData;
  onUpdateTruck?: (data: FormData) => void;
  onClose?: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const TRUCK_TYPES = [
  'Mini Truck', 'Light Commercial Vehicle', 'Medium Commercial Vehicle',
  'Heavy Commercial Vehicle', 'Multi Axle Vehicle', 'Trailer', 'Container',
  'Tanker', 'Tipper', 'Open Body', 'Closed Body'
];

function EditTruck({ initialData, onUpdateTruck, onClose }: EditTruckProps) {
  const [formData, setFormData] = useState<TruckData>({
    truckOwnerName: '',
    truckOwnerMobileNo: '',
    truckType: '',
    capacity: '',
    operatingStates: [],
    truckImage: '',
    rcValidity: '',
    tyres: ''
  });
  const [truckFile, setTruckFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Partial<TruckData>>({});

  console.log(initialData, 'initialData');
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        rcValidity: initialData.rcValidity
          ? new Date(initialData.rcValidity).toISOString().split('T')[0]
          : ''
      });
      setImagePreview(initialData.truckImage);
    }
  }, [initialData]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof TruckData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStateChange = (state: string) => {
    setFormData(prev => ({
      ...prev,
      operatingStates: prev.operatingStates.includes(state)
        ? prev.operatingStates.filter(s => s !== state)
        : [...prev.operatingStates, state]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTruckFile(file)
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          truckImage: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TruckData> = {};

    if (!formData.truckOwnerName.trim()) {
      newErrors.truckOwnerName = 'Owner name is required';
    }

    if (!formData.truckOwnerMobileNo.trim()) {
      newErrors.truckOwnerMobileNo = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.truckOwnerMobileNo)) {
      newErrors.truckOwnerMobileNo = 'Enter valid 10-digit mobile number';
    }

    if (!formData.truckType) {
      newErrors.truckType = 'Truck type is required';
    }

    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Capacity is required';
    }

    if (formData.operatingStates.length === 0) {
      newErrors.operatingStates = ['At least one operating state is required'];
    }

    if (!formData.rcValidity) {
      newErrors.rcValidity = 'RC validity date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();


    if (validateForm()) {

      const formDataToSend = new FormData();

      formDataToSend.append('_id', formData._id as string)
      formDataToSend.append('truckOwnerName', formData.truckOwnerName);
      formDataToSend.append('truckOwnerMobileNo', formData.truckOwnerMobileNo);
      formDataToSend.append('tyres', formData.tyres);
      formDataToSend.append('truckType', formData.truckType);
      formDataToSend.append('capacity', formData.capacity);
      formDataToSend.append('rcValidity', formData.rcValidity);
      formDataToSend.append('operatingStates', JSON.stringify(formData.operatingStates));
      if (truckFile) {
        formDataToSend.append('truckImage', truckFile)
      }

      onUpdateTruck?.(formDataToSend);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('truck-image-input') as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Edit Truck Details</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-8 pb-5">
          <div className="space-y-8 ">
            <div className='flex justify-center'>


              <div className="bg-gray-50 rounded-xl p-6 ">
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  Truck Image
                </label>
                <div
                  onClick={triggerFileInput}
                  className="relative cursor-pointer group "
                >
                  <input
                    id="truck-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Truck preview"
                        className="w-md h-48 object-cover rounded-xl border-4 border-dashed border-gray-300 transition-all group-hover:border-blue-400"
                      />
                      <div className="absolute w-md inset-0 bg-black bg-opacity-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-3xl mb-2">📷</div>
                          <p className="text-sm font-medium">Click to change image</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 border-4 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-blue-400 transition-colors">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-3">📷</div>
                        <p className="text-lg font-medium">Click to upload truck image</p>
                        <p className="text-sm">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Owner Details Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b-2 border-blue-100 pb-2">
                  Owner Details
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    name="truckOwnerName"
                    value={formData.truckOwnerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter owner name"
                  />
                  {errors.truckOwnerName && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.truckOwnerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Owner Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="truckOwnerMobileNo"
                    value={formData.truckOwnerMobileNo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                  {errors.truckOwnerMobileNo && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.truckOwnerMobileNo}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tyres *
                  </label>
                  <input
                    type="text"
                    name="tyres"
                    value={formData.tyres}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter 10-digit mobile number"
                  />
                  {errors.tyres && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.tyres}
                    </p>
                  )}
                </div>
              </div>

              {/* Truck Details Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b-2 border-blue-100 pb-2">
                  Truck Details
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Truck Type *
                  </label>
                  <select
                    name="truckType"
                    value={formData.truckType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">{formData.truckType}</option>
                    {TRUCK_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.truckType && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.truckType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Capacity *
                  </label>
                  <input
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., 10 Tons, 32 Feet"
                  />
                  {errors.capacity && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.capacity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    RC Validity Date *
                  </label>
                  <input
                    type="date"
                    name="rcValidity"
                    value={formData.rcValidity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  {errors.rcValidity && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.rcValidity}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Operating States Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                Operating States * (Select multiple)
              </label>
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 max-h-56 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {INDIAN_STATES.map(state => (
                    <label key={state} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.operatingStates.includes(state)}
                        onChange={() => handleStateChange(state)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 font-medium">{state}</span>
                    </label>
                  ))}
                </div>
              </div>
              {errors.operatingStates && (
                <p className="text-red-500 text-sm mt-3 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.operatingStates[0]}
                </p>
              )}
              {formData.operatingStates.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    Selected States ({formData.operatingStates.length}):
                  </p>
                  <p className="text-sm text-blue-700">
                    {formData.operatingStates.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all shadow-lg"
              >
                Update Truck
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditTruck;