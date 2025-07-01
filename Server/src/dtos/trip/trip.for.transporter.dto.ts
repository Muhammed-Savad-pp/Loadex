
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