

export interface RequestedTruckForAdminDTO {
    _id: string;
    transporterId: string,
    truckOwnerName: string,
    truckOwnerMobileNo: string,
    truckNo: string,
    truckType: string,
    capacity: string,
    tyres: string,
    driverName: string,
    driverMobileNo: string,
    currentLocation: string,
    pickupLocation: string,
    dropLocation: string,
    verificationStatus: string,
    operatingStates: string[],
    rcBook: string,
    driverLicense: string,
    available: boolean,
    createdAt: Date;
    rcValidity: Date;
    truckImage: string
}