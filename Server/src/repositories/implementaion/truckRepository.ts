import Truck, { ITruck } from "../../models/TruckModel";
import { ITruckRepository } from "../interface/ITruckRepository";
import { BaseRepositories } from "./baseRepositories";


class TruckRepository extends BaseRepositories<ITruck> implements ITruckRepository {

    constructor() {
        super(Truck)
    }

    async createTruck(truckData: Partial<ITruck>): Promise<ITruck | null> {
        try {

            return await this.model.create(truckData)

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async findTruckByRcno(RcNo: string): Promise<ITruck | null> {
        try {

            return await Truck.findOne({ truckNo: RcNo })

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async getRequestedTrucks(): Promise<ITruck[]> {
        try {

            const projection = {
                transporterId: 1,
                truckOwnerName: 1,
                truckOwnerMobileNo: 1,
                truckNo: 1,
                truckType: 1,
                capacity: 1,
                tyres: 1,
                driverName: 1,
                driverMobileNo: 1,
                currentLocation: 1,
                pickupLocation: 1,
                dropLocation: 1,
                verificationStatus: 1,
                operatingStates: 1,
                rcBook: 1,
                driverLicense: 1,
                available: 1,
                createdAt: 1,
                rcValidity: 1,
                truckImage: 1
            }

            return await this.model.find({ verificationStatus: 'requested' }, projection)


        } catch (error) {
            throw new Error(`Error in find RequestedTrucks: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async updateTruckById(truckId: string, truckData: Partial<ITruck>): Promise<ITruck | null> {
        try {

            return await this.updateById(truckId, { $set: truckData }, { new: true });

        } catch (error) {
            throw new Error(`Error in updateTruckById: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async findTrucks(id: string): Promise<ITruck[] | null> {
        try {

            const projection = {
                truckOwnerName: 1,
                truckOwnerMobileNo: 1,
                truckNo: 1,
                truckType: 1,
                capacity: 1,
                tyres: 1,
                driverName: 1,
                driverMobileNo: 1,
                currentLocation: 1,
                pickupLocation: 1,
                dropLocation: 1,
                verificationStatus: 1,
                operatingStates: 1,
                available: 1,
                driverLicense: 1,
                status: 1,
            }

            return await this.find({ transporterId: id }, projection);

        } catch (error) {
            throw new Error(`Error in FindTrucks ${error instanceof Error ? error.message : String(error)}`)
        }
    }


    async findTruckById(id: string): Promise<ITruck | null> {
        try {

            return await this.findById(id)

        } catch (error) {
            throw new Error(`Error in FindTruckById ${error instanceof Error ? error.message : String(error)}`)
        }
    }


}

export default new TruckRepository()