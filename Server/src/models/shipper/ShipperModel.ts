import mongoose, {Document, Schema} from "mongoose";


export interface IShipper extends Document {
    shipperName: string,
    email: string,
    phone: string,
    password: string,
    isBlocked: boolean,
    isVerified: boolean
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

    passsword: {
        type:String,
    },

    isBlocked: {
        type: Boolean,
        default: false,
    },

    isVerified: {
        type: Boolean,
        default: false
    }
})


export default mongoose.model<IShipper>('Shipper', shipperSchema);
