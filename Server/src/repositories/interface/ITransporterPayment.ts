import { IBaseRepository } from "./IBaseRepository";
import { ITransporterPayment } from "../../models/TransporterPayment";

export interface ITransporterPaymentRepository extends IBaseRepository<ITransporterPayment> {

    createPayment(paymentData: Partial<ITransporterPayment>): Promise<ITransporterPayment | null>
    findTransporterPaymentByTransactionIdAndUpdate(transactionId: string, status: string): Promise<ITransporterPayment | null>

} 
