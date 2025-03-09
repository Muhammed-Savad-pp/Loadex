import Transporter,{ITransporter} from "../../models/transporter/TransporterModel"
import { BaseRepositories } from "./baseRepositories";
import Truck, {ITruck} from '../../models/transporter/TruckModel';
import { ITransporterRepository } from "../interface/ITransporterRepository";

 class TransporterRepository extends BaseRepositories<ITransporter> implements ITransporterRepository {

    constructor(){
        super(Transporter)
    }

    async createTransporter(data: Partial<ITransporter> ): Promise <ITransporter | null> {
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

    async findTransporterById(id: string): Promise<ITransporter | null>  {
        return await this.model.findById(id).exec();
    }

    async updateTransporterById(transporterId: string, transporterData: Partial<ITransporter>) : Promise<ITransporter | null> {
        try {
            
            return await this.updateById(transporterId, transporterData);

        } catch (error) {
            throw new Error(String(error))
        }
    }

    async createTruck(truckData: Partial<ITruck>) : Promise<ITruck | null> {
        return await Truck.create(truckData)
    }

    async FindTruckByRcno(RcNo: string) : Promise <ITruck | null> {
        return await Truck.findOne({truckNo: RcNo})
    }

    async getTransporter(): Promise<ITransporter[]> {
        try {
            
            const projection = {
                transporterName: 1,
                email: 1,
                phone: 1,
                isBlocked: 1,
            };

            return await this.find({}, projection)

        } catch (error) {
            throw new Error (`Error while find Transporter by admin: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async updateTransporterStatus(id: string, isBlocked: boolean): Promise<ITransporter | null> {
        try {

            return await this.updateById(id, {isBlocked} as Partial<ITransporter>)
            
        } catch (error) {
            throw new Error(`Error while updating Transporter status: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async getRequestedTransporter(): Promise<ITransporter[]> {
        try {
            
            const projection = {
                transporterName: 1,
                verificationStatus: 1,
                email: 1,
                phone: 1,
                panNumber:1,
                aadhaarFront:1,
                aadhaarBack:1,
            }

            return await this.find({verificationStatus:"requested"}, projection)

        } catch (error) {
            throw new Error(`Error in find RequesteTranporter: ${error instanceof Error ? error.message : String(error)}`)
        }
    }
 
}

export default new TransporterRepository();