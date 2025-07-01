import mongoose, {Schema, Document, Types} from "mongoose";

export interface IChat extends Document {
    shipperId: Types.ObjectId;
    transporterId: Types.ObjectId;
    lastMessage?: string;
}

const chatSchema = new Schema<IChat>(
    {

        shipperId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shipper',
            required: true
        },

        transporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transporter',
            required: true
        },

        lastMessage: {
            type: String,
            default: null
        }
    },
    {timestamps: true}
)

chatSchema.index({shipperId: 1, transporterId: 1}, {unique: true});

export default mongoose.model<IChat>('Chat', chatSchema)