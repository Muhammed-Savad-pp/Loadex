interface LoadTransporterDTO {
    _id: string;
    companyName: string;
    shipperName: string;
}

interface LoadPickupCoordinatesDTO {
    latitude: number;
    longitude: number
}

interface LoadDropCoordinatesDTO {
    latitude: number;
    longitude: number
}

export interface LoadForTransporterDTO {
    _id: string;
    shipperId: LoadTransporterDTO;
    pickupLocation: string;
    dropLocation: string;
    material: string;
    quantity: string;
    scheduledDate: Date;
    length: string;
    truckType: string;
    transportationRent: string;
    height: string;
    breadth: string;
    descriptions: string;
    pickupCoordinates: LoadPickupCoordinatesDTO;
    dropCoordinates: LoadDropCoordinatesDTO;
    distanceInKm: number
}

export interface LoadForShipperDTO {
    _id: string;
    pickupLocation: string;
    dropLocation: string;
    material: string;
    quantity: string;
    length: string;
    truckType: string;
    transportationRent: string;
    height: string;
    breadth: string;
    status: string;
    scheduledDate: Date;
    createdAt: Date;
    descriptions: string;
    pickupCoordinates: LoadPickupCoordinatesDTO
    dropCoordinates: LoadDropCoordinatesDTO
}