import mongoose, {Document, Types, Schema} from "mongoose";


export interface ITruck extends Document {

    transporterId?: string,
    truckOwnerName?: string,
    truckOwnerMobileNo?: string,
    truckNo?: string,
    truckType?: string,
    capacity?: string,
    tyres?: string,
    driverName?: string,
    driverMobileNo?: string,
    currentLocation?: string,
    pickupLocation?: string,
    dropLocation?: string,
    verificationStatus?: 'requested' | 'approved' | 'rejected',
    operatingStates?: string[],
    rcBook?: string,
    driverLicense?: string, 
    available?: boolean,
    createdAt?: Date;
}

const truckSchema: Schema = new Schema({
    
    transporterId: {
        type:String,
        required: true,
    },

    truckOwnerName: {
        type: String,
        required: true,
    },

    truckOwnerMobileNo: {
        type: String,
        required: true
    },

    truckNo: {
        type: String,
        required: true,
    },

    truckType: {
        type: String,
        required: true
    },

    capacity: {
        type: String,
        required: true,
    },

    tyres: {
        type: String,
        required: true,
    },

    driverName: {
        type: String,
        required: true,
    },

    driverMobileNo: {
        type: String,
        required: true,
    },

    currentLocation: {
        type: String,
        requried: true,
    },

    pickupLocation: {
        type: String,
        required: true,
    },

    dropLocation: {
        type: String,
        required: true,
    },

    verificationStatus: {
        type: String,
        enum:['requested', 'approved', 'rejected'],
        default: 'requested',
    },

    operatingStates: {
        type: [String]
    },

    rcBook: {
        type: String,
        required: true,
    },

    driverLicense: {
        type: String,
        required: true,
    },

    available: {
        type: Boolean,
        default: false,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model<ITruck>('Truck', truckSchema)