import { FilterQuery } from "mongoose";
import { IBid } from "../../models/BidModel";
import { IBaseRepository } from "./IBaseRepository";
import { DeleteResult } from "mongoose";


export interface IBidRepository extends IBaseRepository<IBid> {

    createBid(bidData: Partial<IBid>) : Promise< IBid | null>;
    findBidsForTransporter(transporterId: string): Promise<IBid[] | null>;
    findBidsForShipper(shipperId: string): Promise<IBid[] | null>;
    updateBidStatus(bidId: string, status: string): Promise<IBid | null>;
    findBidById(bidId: string): Promise<IBid | null>;
    findBidAndUpdate(bidId: string, bidData: Partial<IBid>): Promise<IBid | null>;
    deleteBids(filter: FilterQuery<Partial<IBid>>): Promise<DeleteResult>
}