import mongoose, {Document, Schema, Types} from "mongoose";

export interface IMessage extends Document{
    chatId: Types.ObjectId;
    senderId: string;
    receiverId: string;
    message: string;
    timeStamp: Date;
    isRead: boolean;
}

const messageSchema = new Schema<IMessage>(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },

        senderId: {
            type: String,
            required: true,
        },

        receiverId: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        timeStamp: {
            type: Date,
            default: Date.now,
        },

        isRead: {
            type: Boolean,
            default: false,
        }
    }
)

export default mongoose.model<IMessage>('Message', messageSchema)