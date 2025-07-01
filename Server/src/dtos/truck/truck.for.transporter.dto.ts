

export interface TruckDTO {
    _id: string;
    available: boolean;
    currentLocation: string;
    driverMobileNo: string;
    driverName: string;
    dropLocation: string;
    operatingStates: string[];
    pickupLocation: string;
    truckNo: string;
    truckOwnerMobileNo: string;
    truckOwnerName: string;
    truckType: string;
    tyres: string;
    verificationStatus: string;
    capacity: string;
    driverLicense: string;
    status: string;
    truckImage: string;
    rcValidity: Date;
}