import mongoose, {Document, ObjectId, Schema, Types} from "mongoose";

export interface ILoad extends Document {
    shipperId: Types.ObjectId;
    pickupLocation: string;
    dropLocation: string;
    material: string;
    quantity: string;
    scheduledDate: Date;
    createdAt: Date;
    length?: string;
    truckType: string;
    transportationRent: string;
    height?:string;
    breadth?: string;
    descriptions?: string;
    status: 'active' | 'in-Transit' | 'completed' | 'expired ';
    pickupCoordinates: {
        latitude: number,
        longitude: number,
    },
    dropCoordinates: {
        latitude: number,
        longitude: number,
    },

    distanceInKm: number,
    updateAt: Date,
}

const LoadSchema: Schema = new Schema ({
    shipperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shipper",
        required: true
    },

    pickupLocation: {
        type: String,
        required: true,
    },

    dropLocation: {
        type: String,
        required: true,
    },

    material: {
        type: String,
        required: true,
    },

    quantity: {
        type: String,
        required: true,
    },

    scheduledDate: { 
        type: Date,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    length: {
        type: String,
    },

    truckType: {
        type: String,
        required: true,
    },

    transportationRent: {
        type: String,
        required: true,
    },

    height: {
        type: String,
    },

    breadth: {
        type: String,
    },

    descriptions: {
        type: String,
    },

    status: {
        type: String,
        enum: ['active', 'in-Transit', 'completed', 'expired' ],
        default: 'active'
    },

    pickupCoordinates: {
        latitude: {
            type: Number,
            required: true,
        }, 
        longitude: {
            type: Number,
            required: true,
        }

    },
    dropCoordinates: {
        latitude: {
            type:Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        }
    },

    distanceInKm: {
        type: Number,
        requried: true,
    },

}, {timestamps: true});

export default mongoose.model<ILoad>('Load', LoadSchema)