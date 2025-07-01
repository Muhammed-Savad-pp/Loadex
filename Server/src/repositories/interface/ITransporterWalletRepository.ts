import { IBaseRepository } from "./IBaseRepository";
import { ITransporterWallet } from "../../models/TransporterWallet";

export interface ITransporterWalletRepository extends IBaseRepository<ITransporterWallet> {
    createWallet(walletData: Partial<ITransporterWallet>): Promise<ITransporterWallet>
    addMoneyInWallet(transporterId: string, amount: string): Promise<ITransporterWallet | null>;
    decrementMoneyInWallet (transporterId: string, amount: number): Promise<ITransporterWallet | null> 
}