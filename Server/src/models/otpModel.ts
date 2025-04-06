import mongoose, {Document, Schema} from "mongoose";


export interface IOtp extends Document {
    email: string,
    otp: string,
    createdAt:Date;
}

const OtpSchema: Schema = new Schema ({

    email: {
        type: String,
        required: true,
    },

    otp: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: '2m'
    }
}) 

const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
export default Otp;