import { ITruck } from "../../models/TruckModel";
import { IBaseRepository } from "./IBaseRepository";


export interface ITruckRepository extends IBaseRepository<ITruck> {

    createTruck(truckData: Partial<ITruck>) : Promise<ITruck | null>;
    findTruckByRcno(RcNo: string) : Promise <ITruck | null>;
    getRequestedTrucks(): Promise<ITruck[]>;
    updateTruckById(truckId: string, truckData: Partial<ITruck>) : Promise<ITruck | null>;
    findTrucks(id: string): Promise<ITruck[] | null>;
    findTruckById(id: string) : Promise<ITruck | null>;
    // findUsingPopulate()
}