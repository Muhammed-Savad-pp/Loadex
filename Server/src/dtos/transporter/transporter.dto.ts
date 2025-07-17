
interface SubscriptionForTransporterDTO {
    status: string;
    isActive: boolean;
}

export interface TransporterDTO {
    transporterName: string;
    email: string;
    phone: string;
    verificationStatus: string,
    panNumber: string,
    aadhaarFront: string,
    aadhaarBack: string,
    profileImage: string,
    followers: string[],
    followings: string[],
    subscription: SubscriptionForTransporterDTO
}

export interface ShipperForTransporterDTO {
    _id: string;
    shipperName: string;
    companyName: string;
    profileImage: string;
    followers: string[];
    followings: string[];
}

export interface ShipperForTransporterDirectoryDTO {
    _id: string;
    shipperName: string;
    companyName: string;
    email: string;
    profileImage: string;
}