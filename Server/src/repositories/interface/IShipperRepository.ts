import { IBid } from "../../models/BidModel";
import { ILoad } from "../../models/LoadModel";
import { IShipper } from "../../models/ShipperModel";
import { IBaseRepository } from "./IBaseRepository";
import { UpdateResult } from "mongoose";


export interface IShipperRepository extends IBaseRepository<IShipper>{

    createShipper(data: any): Promise<IShipper | null>;
    findShipperByEmail(email: string): Promise<IShipper | null>;
    verifyShipper(email: string, isVerified:boolean): Promise<IShipper | null>
    updateShipperById(shipperId: string, shipperData: Partial<IShipper>): Promise<IShipper | null>;
    getShipper(): Promise<IShipper[]>;
    findShipperById(id: string): Promise<IShipper | null>;
    updateShipperStatus(id: string, isBlocked: boolean): Promise<IShipper | null>;
    getRequestedShipper() : Promise<IShipper[]>;
    findByCustomerId(customerId: string): Promise<IShipper | null>
    expiredSubscriptionUpdate(today: Date): Promise<UpdateResult>
}