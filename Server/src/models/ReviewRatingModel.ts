import mongoose, {Schema, Document, Types} from "mongoose"


export interface IRatingReview extends Document {
    from: { id: Types.ObjectId; role: 'Shipper' | 'Transporter' };
    to: {id: Types.ObjectId; role: 'Shipper' | 'Transporter'};
    rating: number;
    review: string;
    createdAt: Date;
}

const ReviewRatingSchema: Schema = new Schema ({
    from: {
        id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'from.role'},
        role: { type: String, enum: ['Shipper', 'Transporter'], required: true},
    },
    to: {
        id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'to.role' },
        role: { type: String, enum: ['Shipper', 'Transporter'], required: true}
    },
    rating: { type: Number, required: true, min: 1, max: 5},
    review: { type: String, required: true },
    createdAt: { type: Date, default: Date.now}
})

export default mongoose.model<IRatingReview>('ReviewRating', ReviewRatingSchema);
