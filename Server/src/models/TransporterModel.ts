import mongoose, {Document, Schema} from "mongoose";

export interface ITransporter extends Document {
    transporterName: string;
    email: string;
    phone: string;
    password: string;
    isBlocked: boolean;
    isVerified: boolean;
    verificationStatus?: 'pending'| 'requested'| 'approved'| 'rejected';
    panNumber?:string;
    aadhaarFront?: string;
    aadhaarBack?: string;
}

const transporterSchema: Schema = new Schema ({
    transporterName: {
        type: String,
        required:true
    },

    email: {
        type: String, 
        required:true
    },

    phone: {
        type: String,
        required:true
    },

    password: {
        type: String,
    },

    isBlocked: {
        type: Boolean,
        default: false
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    verificationStatus: {
        type: String,
        enum: ['pending', 'requested', 'approved', 'rejected'],
        default: 'pending'
    },

    panNumber: {
        type: String,
    },

    aadhaarFront: {
        type: String
    },

    aadhaarBack: {
        type: String
    }
})

export default mongoose.model<ITransporter>('Transporter', transporterSchema)