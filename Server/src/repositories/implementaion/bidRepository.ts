import { FilterQuery } from "mongoose";
import Bid, { IBid } from "../../models/BidModel";
import { IBidRepository } from "../interface/IBidRepository";
import { BaseRepositories } from "./baseRepositories";
import { DeleteResult } from "mongoose";


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
                    { path: 'shipperId', select: 'shipperName' },
                    { path: 'truckId', select: 'truckNo truckType capacity' },
                    { path: 'loadId', select: 'pickupLocation dropLocation material quantity scheduledDate ' }
                ]
            );


        } catch (error) {
            throw new Error(`Error in createBid ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async findBidsForShipper(shipperId: string): Promise<IBid[] | null> {
        try {

            return await this.findWithPopulate(
                { shipperId: shipperId },
                [
                    { path: 'transporterId', select: 'transporterName' },
                    { path: 'truckId', select: 'truckNo truckType capacity' },
                    { path: 'loadId', select: 'pickupLocation dropLocation material quantity scheduledDate distanceInKm' }
                ]
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


}

export default new BidRepository();