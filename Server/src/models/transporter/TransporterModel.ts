import mongoose, {Document, Schema} from "mongoose";

export interface ITransporter extends Document {
    transporterName: string,
    email: string,
    phone: string,
    password: string,
    isBlocked: boolean,
    isVerified: boolean,
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
    }
})

export default mongoose.model<ITransporter>('Transporter', transporterSchema)