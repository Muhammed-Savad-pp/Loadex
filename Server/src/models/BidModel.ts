import mongoose, {Document, Schema, Types} from "mongoose";

export interface IBid extends Document {
    shipperId: Types.ObjectId;
    transporterId: Types.ObjectId;
    loadId: Types.ObjectId;
    truckId: Types.ObjectId;
    price: string;
    status: 'requested' | 'accepted' | 'rejected' | 'expired'; 
    shipperPayment: boolean;
    transporterPayment: boolean;
    createAt: Date;
}

const bidSchema: Schema = new Schema ({

    shipperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipper',
        required: true
    },

    transporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transporter",
        required: true,
    },

    loadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Load',
        required: true,
    },

    truckId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Truck',
        required: true,
    },

    price:{
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['requested' , 'accepted' , 'rejected', 'expired'],
        default: 'requested'
    },

    shipperPayment: {
        type: Boolean,
        default: false,
    },

    transporterPayment: {
        type: Boolean,
        default: false,
    },

    createAt: {
        type: Date,
        default: Date.now,
    },
})

export default mongoose.model<IBid>('Bid', bidSchema)