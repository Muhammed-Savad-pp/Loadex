import TransporterPayment, { ITransporterPayment } from "../../models/TransporterPayment";
import { ITransporterPaymentRepository } from "../interface/ITransporterPayment";
import { BaseRepositories } from "./baseRepositories";


class TransporterPaymentRepository extends BaseRepositories<ITransporterPayment> implements ITransporterPaymentRepository {
    
    constructor() {
        super(TransporterPayment)
    }

    async createPayment(paymentData: Partial<ITransporterPayment>): Promise<ITransporterPayment | null> {
        try {
            
            return await this.model.create(paymentData);

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async findTransporterPaymentByTransactionIdAndUpdate(transactionId: string, status: string): Promise<ITransporterPayment | null> {
        try {
            
            return await TransporterPayment.findOneAndUpdate({transactionId: transactionId}, {paymentStatus: status})

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

} 


export default new TransporterPaymentRepository();
