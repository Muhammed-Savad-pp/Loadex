import { IRatingReview } from "../../models/ReviewRatingModel";

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

// export class ReviewForTransporter {
//     public readonly _id: string;
//     public readonly from: FromForTransporterReviewDTO;
//     public readonly to: ToForTransporterReviewDTO,
//     public readonly rating: number;
//     public readonly review: string;
//     public readonly createdAt: Date;

//     constructor(review: IRatingReview) {
//         this._id = review._id as string;
//         this.from = {
//             id: {
//                 _id: review.from.id._id,
//                 transporterName: review.from.id.transporterName,
//                 profileImage: review.from.id.profileImage,
//             },
//             role: review.from.role,
//         };

//         this.to = {
//             id: review.to.id,
//             role: review.to.role,
//         };

//         this.rating = review.rating;
//         this.review = review.review;
//         this.createdAt = new Date(review.createdAt);
//     }
// }

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
