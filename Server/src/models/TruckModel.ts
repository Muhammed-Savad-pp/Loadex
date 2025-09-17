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
    currentLocationCoords: {lat: number, lng: number}
    pickupLocation?: string,
    pickupLocationCoords: {lat: number, lng: number}
    dropLocation?: string,
    dropLocationCoords: {lat: number, lng: number}
    verificationStatus?: 'requested' | 'approved' | 'rejected',
    operatingStates?: string[],
    rcBook?: string,
    driverLicense?: string, 
    truckImage?: string,
    available?: boolean,
    createdAt?: Date;
    status?: 'active' | 'in-active' | 'in-transit';
    rcValidity: Date;
    rejectReason?: string;
}

const truckSchema: Schema = new Schema({
    
    transporterId: {
        type:String,
        ref: 'Transporter',
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

    truckImage: {
        type: String,

    },

    available: {
        type: Boolean,
        default: false,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    currentLocationCoords: {
        lat: {
            type: Number, 
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },

    pickupLocationCoords: {
        lat: {
            type: Number,
            required: true,
        },
        lng: {
            type: Number,
            required: true,
        }
    },

    dropLocationCoords: {
        lat: {
            type: Number,
            required: true,
        },
        lng: {
            type: Number,
            required: true,
        }
    },

    status:{
        type: String,
        enum: ['active', 'in-active', 'in-transit'],
        default: 'in-active'
    },

    rcValidity: {
        type: Date,
        required: true
    },

    rejectReason: {
        type: String,
    }
    

});

export default mongoose.model<ITruck>('Truck', truckSchema)