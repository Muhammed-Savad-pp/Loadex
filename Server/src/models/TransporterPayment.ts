import mongoose, { Schema, Document, Types } from "mongoose";


export interface ITransporterPayment extends Document {

    transactionId?: string;
    bidId?: Types.ObjectId;
    planId?: string;
    tripId?: Types.ObjectId;
    transporterId: Types.ObjectId;
    paymentType: 'bid' | 'subscription' | 'trip';
    amount: number;
    paymentStatus: 'pending' | 'success' | 'failed',
    createdAt: Date;
    transactionType: 'credit' | 'debit';
    paymentMethod?: 'stripe' | 'wallet';
}

const TransporterPaymentSchema: Schema = new Schema({

    transactionId: {
        type: String
    },

    bidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
    },
    planId: {
        type: String
    },

    transactionType: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },

    transporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transporter',
        required: true,
    },

    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    },

    paymentType: {
        type: String,
        enum: ['bid', 'subscription', 'trip'],
    },

    amount: {
        type: Number,
        required: true,
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
    },

    paymentMethod: {
        type: String,
        enum: ['stripe', 'wallet']
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }

})

export default mongoose.model<ITransporterPayment>('TransporterPayment', TransporterPaymentSchema);


