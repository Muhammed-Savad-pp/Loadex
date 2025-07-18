
interface SubscriptionForTransporterDTO {
    status: string;
    isActive: boolean;
    planId: string;
    planName: string;
    endDate: Date;
    startDate: Date;
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


export interface TransporterForAdminDTO {
    _id: string
    transporterName: string;
    email: string;
    phone: string;
    isBlocked: boolean;
    profileImage: string;
    verificationStatus: string;
    panNumber: string;
    aadhaarFront: string;
    aadhaarBack: string;
}