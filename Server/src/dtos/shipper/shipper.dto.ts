

export interface ShipperDTO {
    shipperName: string;
    email: string;
    phone: string;
    verificationStatus: string;
    panNumber: string;
    aadhaarFront: string;
    aadhaarBack: string;
    companyName: string;
    gstNumber: string;
    profileImage: string
    followers: string[];
    followings: string[];
    subscription: {
        planId: string;
        planName: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        isActive: boolean;
        createdAt: Date | null;
        paidAmount: number;
    }
}

export interface TransporterForShipperDTO {
    _id: string;
    transporterName: string;
    email: string;
    profileImage: string;
    followers: string[];
    followings: string[]
}

export interface ShipperForAdminDTO {
    _id: string
    shipperName: string;
    email: string;
    phone: string;
    isBlocked: boolean;
    companyName: string;
    gstNumber: string;
    verificationStatus: string;
    panNumber: string;
    aadhaarFront: string;
    aadhaarBack: string;
    profileImage: string;
}