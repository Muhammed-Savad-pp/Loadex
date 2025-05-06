import mongoose, { Document, Schema, Types } from "mongoose";


export interface IShipperPayment extends Document {
    transactionId?: string;
    bidId?: Types.ObjectId;
    shipperId: Types.ObjectId;
    paymentType: 'bid' | 'premium';
    amount: number,
    paymentStatus: 'pending' | 'success' | 'failed',
    createdAt: Date
}

const shipperPaymentSchema: Schema = new Schema ({

    transactionId: {
        type: String,
        
    },

    bidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid'
    },

    shipperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipper',
        required: true,
    },

    paymentType: {
        type: String,
        enum: ['bid', 'premium']
    },

    amount: {
        type: Number,
        required: true,
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending' 
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }

})


export default mongoose.model<IShipperPayment>('ShipperPayment', shipperPaymentSchema)