import Shipper, {IShipper} from '../../models/shipper/ShipperModel';
import { BaseRepositories } from './baseRepositories';
import { IShipperRepository } from '../interface/IShipperRepository';

 class ShipperRepositories extends BaseRepositories<IShipper> implements IShipperRepository  {

    constructor() {
        super(Shipper)
    }

    async createShipper(data: any): Promise<IShipper | null> {
        return await Shipper.create(data)
    }

    async findShipperByEmail(email: string): Promise<IShipper | null> {
        const data  = await Shipper.findOne({email});
        const userData = data?.toObject();

        return userData as IShipper
    }

    async findShipperById(id: string): Promise<IShipper | null> {
        return await this.model.findById(id).exec()
    }

    async verifyShipper(email: string, isVerified:boolean): Promise<IShipper | null> {
        await Shipper.updateOne({email}, {isVerified});
        return await Shipper.findOne({email})
    }

    async updateShipperById(shipperId: string, shipperData: Partial<IShipper>): Promise<IShipper | null> {
        try {

            return await this.updateById(shipperId, shipperData);

        } catch (error) {
            throw new Error(String(error))
        }
    }

    async getShipper(): Promise<IShipper[]> {
        try {
            
            const projection = {
                shipperName: 1,
                email: 1,
                phone: 1,
                isBlocked: 1,
            }

            return await this.find({}, projection)

        } catch (error) {
            throw new Error(`error while find shipper by admin ${error instanceof Error ? error.message: String(error)}`)
        }
    }

    async updateShipperStatus(id: string, isBlocked: boolean): Promise<IShipper | null> {
        try {
            
            return await this.updateById(id, {isBlocked} as Partial<IShipper>)

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async getRequestedShipper(): Promise<IShipper[]> {
        try {
            
            const projection = {
                shipperName: 1,
                email: 1, 
                phone:1,
                verificationStatus: 1,
                panNumber: 1,
                aadhaarFront: 1,
                aadhaarBack: 1,
                companyName: 1,
                gstNumber: 1
            }

            return await this.find({verificationStatus:'requested'}, projection);


        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
        
    }
}

export  default new ShipperRepositories()