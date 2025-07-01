import { FilterQuery, ProjectionType } from "mongoose";
import { IShipperPayment } from "../../models/ShipperPaymentModel";
import { IBaseRepository } from "./IBaseRepository";


export interface IShipperPaymentRepository extends IBaseRepository<IShipperPayment> {

    createPayment(paymentData: Partial<IShipperPayment>): Promise<IShipperPayment | null>;
    findShipperPaymentByTransactionIdandUpdate(transactionId: string, status: string,  paymentIntentId?: string): Promise<IShipperPayment |null>

}