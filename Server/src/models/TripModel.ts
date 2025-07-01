import mongoose, {Document, Schema, Types} from "mongoose";


export interface ITrip extends Document {
    transporterId: Types.ObjectId;
    shipperId: Types.ObjectId;
    loadId: Types.ObjectId;
    truckId: Types.ObjectId;
    price: string;
    tripStatus: 'confirmed' | 'inProgress' | 'arrived' | 'completed';
    confirmedAt: Date;
    progressAt?: Date;
    arrivedAt?: Date;
    completedAt?: Date;
    adminPayment: boolean;
}


const TripSchema: Schema = new Schema ({

    transporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transporter',
        requried: true,
    },

    shipperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipper',
        required: true,
    },

    loadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Load',
        required: true,
    },

    truckId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Truck',
        required: true,
    },

    price: {
        type: String,
        required: true,
    },

    tripStatus: {
        type: String,
        enum: ['confirmed', 'inProgress', 'arrived', 'completed'],
        default: 'confirmed'
    },

    confirmedAt: {
        type: Date,
        default: Date.now
    },

    progressAt: {
        type: Date,
    },

    arrivedAt: {
        type: Date,
    },

    completedAt: {
        type: Date,
    },

    adminPayment: {
        type: Boolean,
        default: false
    }

})

export default mongoose.model<ITrip>('Trip', TripSchema);