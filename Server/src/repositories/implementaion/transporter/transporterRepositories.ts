import Transporter,{ITransporter} from "../../../models/transporter/TransporterModel"

export class TransporterRepositories {

    async createTransporter(data: any ): Promise <ITransporter | null> {
        return await Transporter.create(data)
    }

    async findTransporterByEmail(email: string): Promise<ITransporter | null> {
        const data = await Transporter.findOne({email})
        const userData = data?.toObject();

        return userData as ITransporter
        
    }

    async verifyTransporter(email: string, isVerified: boolean): Promise<ITransporter | null> {
        await Transporter.updateOne({email}, {isVerified});
        return await Transporter.findOne({email})
    }

}