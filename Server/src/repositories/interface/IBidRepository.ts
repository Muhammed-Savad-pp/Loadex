import { FilterQuery, UpdateResult } from "mongoose";
import { IBid } from "../../models/BidModel";
import { IBaseRepository } from "./IBaseRepository";
import { DeleteResult } from "mongoose";


export interface IBidRepository extends IBaseRepository<IBid> {

    createBid(bidData: Partial<IBid>) : Promise< IBid | null>;
    findBidsForTransporter(transporterId: string): Promise<IBid[] | null>;
    findBidsForShipper(filter: FilterQuery<IBid>, skip: number, limit: number): Promise<IBid[] | null>
    updateBidStatus(bidId: string, status: string): Promise<IBid | null>;
    findBidById(bidId: string): Promise<IBid | null>;
    findBidAndUpdate(bidId: string, bidData: Partial<IBid>): Promise<IBid | null>;
    deleteBids(filter: FilterQuery<Partial<IBid>>): Promise<DeleteResult>;
    updateBids(filter: FilterQuery<Partial<IBid>>, updateData: Partial<IBid>): Promise<UpdateResult>
}