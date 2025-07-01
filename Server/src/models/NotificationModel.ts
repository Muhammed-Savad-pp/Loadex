import mongoose, {Document, Schema} from "mongoose";

export interface INotification extends Document {
    userId: string;
    userType: 'shipper' | 'transporter';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date
}

const notificationSchema = new Schema<INotification>({
    userId: {
        type: String,
        required: true
    },

    userType: {
        type: String,
        enum: ['shipper', 'transporter'],
        required: true,
    },

    title: {
        type: String,
        required: true,
    },

    message: {
        type: String,
        required: true,
    },

    isRead: {
        type: Boolean,
        default: false,
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})


export default mongoose.model<INotification>('Notification', notificationSchema)
