import mongoose, {Schema,Document,  Types} from "mongoose";


export interface ITransporterPayment extends Document {

    transactionId?: string;
    bidId: Types.ObjectId;
    transporterId: Types.ObjectId;
    paymentType: 'bid' | 'premium';
    amount: number;
    paymentStatus: 'pending' | 'success' | 'failed', 
    createdAt: Date

}

const TransporterPaymentSchema: Schema = new Schema({

    transactionId: {
        type: String
    },

    bidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
    },

    transporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transporter',
        required: true,
    },

    paymentType: {
        type: String,
        enum: ['bid', 'premium'],
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

    createdAt: {
        type: Date,
        default: Date.now,
    }

})

export default mongoose.model<ITransporterPayment>('TransporterPayment', TransporterPaymentSchema);


