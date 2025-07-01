import mongoose, { Schema, Document, Types } from "mongoose";


export interface IAdminPayment extends Document {
    transactionId?: string;
    userType: 'shipper' | 'transporter';
    userId: string;
    amount: number;
    tripId?: Types.ObjectId; 
    transactionType: 'credit' | 'debit';
    paymentFor: 'bid' | 'subscription' | 'refund' | 'trip';
    bidId?: Types.ObjectId;
    subscriptionId?: string;
    paymentStatus: 'pending' | 'success' | 'failed',
    paymentMethod?: 'stripe' | 'wallet';
    createdAt: Date;
    updatedAt: Date;
}

const AdminPaymentSchema = new Schema<IAdminPayment>(
    {

        transactionId: {
            type: String,

        },
        userType: {
            type: String,
            enum: ['shipper', 'transporter'],
            required: true,
        },
        userId: {
            type: String,
            required: true,

        },
        amount: {
            type: Number,
            required: true,
        },
        transactionType: {
            type: String,
            enum: ['credit', 'debit'],
            required: true,
        },
        paymentFor: {
            type: String,
            enum: ['bid', 'subscription', 'refund', 'trip'],
            required: true,
        },
        bidId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bid',
        },
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip'
        },
        subscriptionId: {
            type: String,
        },

        paymentMethod: {
            type: String,
            enum: ['stripe', 'wallet']
        },

        paymentStatus: {
            type: String,
            enum: ['pending', 'success', 'failed'],
            default: 'pending'
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IAdminPayment>('AdminPayment', AdminPaymentSchema);