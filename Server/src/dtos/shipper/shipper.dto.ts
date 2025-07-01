

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
        status: string;
        isActive: boolean
    }

}