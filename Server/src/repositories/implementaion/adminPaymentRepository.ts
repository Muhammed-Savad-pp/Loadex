import AdminPaymentHistory, { IAdminPayment } from "../../models/AdminPaymentModel";
import { IAdminPaymentRepository } from "../interface/IAdminPaymentRepository";
import { BaseRepositories } from "./baseRepositories";


class AdminPaymentRepository extends BaseRepositories<IAdminPayment> implements IAdminPaymentRepository {

    constructor() {
        super(AdminPaymentHistory)
    }

    async createAdminPaymentHistory(paymentData: Partial<IAdminPayment>): Promise<IAdminPayment | null> {
        try {

            return await this.model.create(paymentData)
            
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateBytransactionId(transactionId: string, status: string): Promise<IAdminPayment | null> {
        try {

            const updateData = await this.model.findOneAndUpdate({transactionId: transactionId}, {paymentStatus: status });
            return updateData
            
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

}

export default new AdminPaymentRepository()