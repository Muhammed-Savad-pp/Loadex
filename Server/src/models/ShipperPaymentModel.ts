import mongoose, { Document, Schema, Types } from "mongoose";


export interface IShipperPayment extends Document {
    transactionId?: string;
    bidId?: Types.ObjectId;
    planId?: string;
    shipperId: Types.ObjectId;
    paymentType: 'bid' | 'subscription';
    amount: number,
    paymentStatus: 'pending' | 'success' | 'failed',
    paymentIntentId?: string;
    refundId?: string;
    transactionType: 'credit' | 'debit';
    refundStatus?: 'none' | 'refunded';
    createdAt: Date
}

const shipperPaymentSchema: Schema = new Schema({

    transactionId: {
        type: String,

    },

    bidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid'
    },

    planId: {
        type: String,
    },

    shipperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipper',
        required: true,
    },

    paymentType: {
        type: String,
        enum: ['bid', 'subscription']
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

    transactionType: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },

    paymentIntentId: {
        type: String,
    },

    refundId: {
        type: String,
    },

    refundStatus: {
        type: String,
        enum: ['none', 'refunded'],
        default: 'none',
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
})


export default mongoose.model<IShipperPayment>('ShipperPayment', shipperPaymentSchema)