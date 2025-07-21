
export interface TripForTransporterDTO {
    _id: string;
    shipperId: {
        _id: string;
        shipperName: string;
        phone: string;
        companyName: string;
        profileImage: string
    };
    transporterId: {
        _id: string;
        transporterName: string;
    };
    loadId: {
        _id: string;
        breadth: string;
        distanceInKm: number;
        dropLocation: string;
        height: string;
        length: string;
        material: string;
        pickupLocation: string;
        quantity: string;
        scheduledDate: Date;
        dropCoordinates: {
            latitude: number;
            longitude: number
        }
    };
    truckId: {
        capacity: string;
        driverMobileNo: string;
        driverName: string;
        truckNo: string;
        truckType: string;
    };
    tripStatus: string;
    price: string;
    confirmedAt: Date | null;
    progressAt: Date | null;
    arrivedAt: Date | null;
    completedAt: Date | null;
}


export interface TripForShipperDTO {
    _id: string;
    transporterId: {
        transporterName: string;
        phone: string;
        profileImage: string;
        _id: string
    };
    shipperId: {
        shipperName: string;
    };
    loadId: {
        pickupLocation: string;
        dropLocation: string;
        material: string;
        quantity: string;
        scheduledDate: Date;
        length: string;
        height: string;
        breadth: string;
        descriptions: string;
        distanceInKm: number;
    };
    truckId: {
        truckNo: string;
        truckType: string;
        capacity: string;
        driverName: string;
        driverMobileNo: string;
    };
    price: string;
    tripStatus: string;
    confirmedAt: string;
}

export interface TripForAdminDTO {
    _id: string;
    transporterId: {
        _id: string;
        transporterName: string;
        profileImage: string;
        phone: string;
        email: string;
    };
    shipperId: {
        _id: string;
        shipperName: string;
        profileImage: string;
        phone: string;
        email: string;
    };
    loadId: {
        _id: string;
        pickupLocation: string;
        dropLocation: string;
        material: string;
        quantity: string;
        scheduledDate: Date;
        distanceInKm: number;
    };
    truckId: {
        _id: string;
        truckOwnerName: string;
        truckOwnerMobileNo: string;
        truckNo: string;
        truckType: string;
        driverName: string;
        driverMobileNo: string;
    };
    price: string;
    tripStatus: string;
    confirmedAt: Date;
    progressAt: Date | null;
    arrivedAt: Date | null;
    completedAt: Date | null;
    adminPayment: boolean
}