import { FilterQuery, UpdateResult } from "mongoose";
import Bid, { IBid } from "../../models/BidModel";
import { IBidRepository } from "../interface/IBidRepository";
import { BaseRepositories } from "./baseRepositories";
import { DeleteResult } from "mongoose";
import { skip } from "node:test";


class BidRepository extends BaseRepositories<IBid> implements IBidRepository {

    constructor() {
        super(Bid)
    }

    async createBid(bidData: Partial<IBid>): Promise<IBid | null> {
        try {

            return await this.model.create(bidData)

        } catch (error) {
            throw new Error(`Error in createBid ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async findBidsForTransporter(transporterId: string): Promise<IBid[] | null> {
        try {

            return await this.findWithPopulate(
                { transporterId: transporterId },
                [
                    { path: 'shipperId', select: 'shipperName profileImage' },
                    { path: 'truckId', select: 'truckNo truckType capacity' },
                    { path: 'loadId', select: 'pickupLocation dropLocation material quantity scheduledDate ' }
                ]
            );

        } catch (error) {
            throw new Error(`Error in createBid ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async findBidsForShipper(filter: FilterQuery<IBid>, skip: number, limit: number): Promise<IBid[] | null> {
        try {

            return await this.findWithPopulate(
                filter,
                [
                    { path: 'transporterId', select: 'transporterName profileImage' },
                    { path: 'truckId', select: 'truckNo truckType capacity truckImage' },
                    { path: 'loadId', select: 'pickupLocation dropLocation material quantity scheduledDate distanceInKm' }
                ],
                skip,
                limit,
                {createAt: -1}
            )


        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }


    async updateBidStatus(bidId: string, status: string): Promise<IBid | null> {
        try {

            return await this.updateById(bidId, { $set: { status } }, { new: true });

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async findBidById(bidId: string): Promise<IBid | null> {
        try {

            return await this.findById(bidId);

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async findBidAndUpdate(bidId: string, bidData: Partial<IBid>): Promise<IBid | null> {
        try {
            
            return await this.updateById(bidId, bidData)

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async deleteBids(filter: FilterQuery<Partial<IBid>>): Promise<DeleteResult> {
        try {
            
            return await Bid.deleteMany(filter)

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateBids(filter: FilterQuery<Partial<IBid>>, updateData: Partial<IBid>): Promise<UpdateResult> {
        try {
            
            return await this.model.updateMany(filter, updateData)

        } catch (error) {
            throw new Error(`error in update bids status ${error instanceof Error ? error.message : String(error)}`)
        }
    }


}

export default new BidRepository();