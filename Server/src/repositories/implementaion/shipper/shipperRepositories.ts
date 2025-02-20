import Shipper, {IShipper} from '../../../models/shipper/ShipperModel';

export class ShipperRepositories {

    async createShipper(data: any): Promise<IShipper | null> {
        return await Shipper.create(data)
    }

    async findShipperByEmail(email: string): Promise<IShipper | null> {
        const data  = await Shipper.findOne({email});
        const userData = data?.toObject();

        return userData as IShipper
    }

    async verifyShipper(email: string, isVerified:boolean): Promise<IShipper | null> {
        await Shipper.updateOne({email}, {isVerified});
        return await Shipper.findOne({email})
    }
}