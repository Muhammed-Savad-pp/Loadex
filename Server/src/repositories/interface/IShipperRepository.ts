import { IShipper } from "../../models/shipper/ShipperModel";
import { IBaseRepository } from "./IBaseRepository";


export interface IShipperRepository extends IBaseRepository<IShipper>{
    createShipper(data: any): Promise<IShipper | null>;
    findShipperByEmail(email: string): Promise<IShipper | null>;
    verifyShipper(email: string, isVerified:boolean): Promise<IShipper | null>
    updateShipperById(shipperId: string, shipperData: Partial<IShipper>): Promise<IShipper | null>;
    getShipper(): Promise<IShipper[]>;
    findShipperById(id: string): Promise<IShipper | null>;
    updateShipperStatus(id: string, isBlocked: boolean): Promise<IShipper | null>;
    getRequestedShipper() : Promise<IShipper[]>
}