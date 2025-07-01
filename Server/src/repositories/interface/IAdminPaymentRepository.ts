import { IAdminPayment } from "../../models/AdminPaymentModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IAdminPaymentRepository extends IBaseRepository<IAdminPayment> {
    createAdminPaymentHistory(paymentData: Partial<IAdminPayment>): Promise<IAdminPayment | null>
    updateBytransactionId(transactionId: string, status: string): Promise<IAdminPayment | null>
}