

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