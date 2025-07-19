

export interface TruckForShipperDTO {
     _id: string;
    transporterId: {
        _id: string;
        transporterName: string;
        profileImage: string;
    };
    truckOwnerName: string;
    truckType: string;
    truckNo: string;
    capacity: string;
    tyres: string;
    currentLocation: string;
    operatingStates: string[];
}