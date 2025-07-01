import mongoose, {Schema, Document, Types} from "mongoose";

export interface ITransporterWallet extends Document {
    transporterId: mongoose.Types.ObjectId;
    balance: number;
    createdAt: Date;
    updateAt: Date;
}


const transporterWalletSchema: Schema = new Schema (
    {
        transporterId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Transporter'
        },

        balance: {
            type: Number,
            default: 0,
        }
    },
    { timestamps: true}
)


export default mongoose.model<ITransporterWallet>('TransporterWallet', transporterWalletSchema)