interface TruckFormData {

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
    rcValidity: string
}


export const validateTruckForm = (formData: TruckFormData) => {

    const errors: Partial<TruckFormData> = {};

    if(!formData.vehicleNumber.trim()) errors.vehicleNumber = 'Vehicle number is required';
    if(!formData.ownerName.trim()) errors.ownerName = 'Owner name is required';
    if(!formData.ownerMobileNo.trim()) errors.ownerMobileNo = 'Owner Mobile number is required';
    if(!formData.type.trim()) errors.type = 'Truck type is required';
    if(!formData.capacity.trim()) errors.capacity = 'Capacity is required';
    if(!formData.tyres.trim()) errors.tyres = 'Tyres count is required';
    if(!formData.driverName.trim()) errors.driverName = 'Driver name is required';
    if(!formData.driverMobileNumber.trim()) errors.driverMobileNumber = 'Driver mobile number is required';
    if(!formData.currentLocation.trim()) errors.currentLocation = 'Current location is required';
    if(!formData.from.trim()) errors.from = 'From location is required';
    if(!formData.to.trim()) errors.to = 'To location is required';
    if(!formData.rcValidity.trim()) errors.rcValidity = 'RC Validity is required'

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.ownerMobileNo)) errors.ownerMobileNo = "Enter a valid 10-digit mobile number.";
    if (!phoneRegex.test(formData.driverMobileNumber)) errors.driverMobileNumber = "Enter a valid 10-digit mobile number.";
    if (!Array.isArray(formData.selectedLocations) || formData.selectedLocations.length === 0) {
        errors.selectedLocations = ["Select at least one location."];
    }

    const registerNoRegex = /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{1,4}$/;
    if(formData.vehicleNumber && !registerNoRegex.test(formData.vehicleNumber.toUpperCase())) errors.vehicleNumber = 'Enter valide vehicle number'
    
    const capacityValue = Number(formData.capacity)
    if(isNaN(capacityValue) || capacityValue <= 0) {
        errors.capacity = "Capacity must be a number greater than 0.";
    } 

    const tyresValue = Number(formData.tyres) 

    if(isNaN(tyresValue) || tyresValue < 4) {
        errors.tyres = 'Tyres must be 4'
    }

    return errors

}