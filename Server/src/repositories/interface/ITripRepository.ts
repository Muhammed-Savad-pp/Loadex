import { FilterQuery } from "mongoose";
import { ITrip } from "../../models/TripModel";
import { IBaseRepository } from "./IBaseRepository";

export interface ITripRepository extends IBaseRepository<ITrip> {

    createTrip(tripData: Partial<ITrip>): Promise<ITrip | null>;
    findTrips(filter: FilterQuery<ITrip>, populateOptions: {path: string, select?: string}[] ): Promise<ITrip[] | null>
    findByIdAndUpdate(tripId: string, updateData: Partial<ITrip>): Promise<ITrip| null>

}

