import mongoose, {Document, Schema} from "mongoose";


export interface IShipper extends Document {
    shipperName: string;
    email: string;
    phone: string;
    password: string;
    isBlocked: boolean;
    isVerified: boolean;
    verificationStatus?: 'pending'| 'requested'| 'approved'| 'rejected';
    panNumber?:string;
    aadhaarFront?: string;
    aadhaarBack?: string;
    companyName?: string;
    gstNumber?: string;
    profileImage?: string;
    followers?: string[];
    followings?: string[];  
}

const shipperSchema: Schema = new Schema ({
    shipperName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
    },

    phone: {
        type: String,
        required: true
    },

    password: {
        type:String,
    },

    isBlocked: {
        type: Boolean,
        default: false,
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationStatus: {
        type: String,
        enum: ['pending', 'requested', 'approved', 'rejected'],
        default: 'pending'
    },

    panNumber: {
        type: String
    },

    aadhaarFront: {
        type: String
    },

    aadhaarBack: {
        type: String
    },

    companyName: {
        type: String
    },

    gstNumber: {
        type: String
    },

    profileImage: {
        type: String,
    },

    followers: {
        type: [String]
    },

    followings: {
        type: [String],
    }, 

})


export default mongoose.model<IShipper>('Shipper', shipperSchema);
