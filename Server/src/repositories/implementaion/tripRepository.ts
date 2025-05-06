import { FilterQuery } from "mongoose";
import Trip, { ITrip } from "../../models/TripModel";
import { ITripRepository } from "../interface/ITripRepository";
import { BaseRepositories } from "./baseRepositories";


class TripRepository extends BaseRepositories<ITrip> implements ITripRepository {

    constructor() {
        super(Trip)
    }

    async createTrip(tripData: Partial<ITrip>): Promise<ITrip | null> {
        try {

            return await this.model.create(tripData)
            
        } catch (error) {
            throw new Error( error instanceof Error ? error.message : String(error))
        }
    }

    async findTrips(filter: FilterQuery<ITrip>, populateOptions: { path: string; select?: string; }[]): Promise<ITrip[] | null> {
        try {

            return await this.findWithPopulate(filter, populateOptions)
            
        } catch (error) {
            throw new Error( error instanceof Error ? error.message : String(error))
        }
    }

    async findByIdAndUpdate(tripId: string, updateData: Partial<ITrip>): Promise<ITrip | null> {
        try {
            
            return await this.updateById(tripId, updateData);

        } catch (error) {
            throw new Error (error instanceof Error ? error.message : String(error))
        }
    }
}

export default new TripRepository();