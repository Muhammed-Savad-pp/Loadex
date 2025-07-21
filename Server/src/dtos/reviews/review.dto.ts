interface IdDTO {
    _id: string;
    transporterName: string;
    profileImage: string
}

interface FromForTransporterReviewDTO {
    id: IdDTO;
    role: string;
}

interface ToForTransporterReviewDTO {
    id: string;
    role: string;
}

export interface ReviewForTransporter {
    _id: string;
    from: FromForTransporterReviewDTO;
    to: ToForTransporterReviewDTO,
    rating: number;
    review: string;
    createdAt: Date;
}

export interface ReviewForShipperDTO {
    _id: string;
    from: {
        id: {
            _id: string;
            shipperName: string;
            profileImage: string;
        };
        role: string
    }
    to: {
        id: string;
        role: string;
    };
    rating: number;
    review: string;
    createdAt: Date
}
