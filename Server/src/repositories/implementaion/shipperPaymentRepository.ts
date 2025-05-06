import { FilterQuery } from "mongoose";
import ShipperPayment, { IShipperPayment } from "../../models/ShipperPaymentModel";
import { IShipperPaymentRepository } from "../interface/IShipperPaymentRepository";
import { BaseRepositories } from "./baseRepositories";


class ShipperPaymentRepository extends BaseRepositories<IShipperPayment> implements IShipperPaymentRepository {

    constructor() {
        super(ShipperPayment)
    }

    async createPayment(paymentData: Partial<IShipperPayment>): Promise<IShipperPayment | null> {
        try {
            
            return await this.model.create(paymentData);

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async findShipperPaymentByTransactionIdandUpdate(transactionId: string, status: string): Promise<IShipperPayment | null> {
        try {
            
            return await ShipperPayment.findOneAndUpdate({transactionId: transactionId}, {paymentStatus: status});

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

}


export default new ShipperPaymentRepository();