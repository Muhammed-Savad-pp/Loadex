import TransporterWallet, { ITransporterWallet } from "../../models/TransporterWallet";
import { ITransporterWalletRepository } from "../interface/ITransporterWalletRepository";
import { BaseRepositories } from "./baseRepositories";

class TransporterWalletRepositroy extends BaseRepositories<ITransporterWallet> implements ITransporterWalletRepository {

    constructor() {
        super(TransporterWallet)
    }

    async createWallet(walletData: Partial<ITransporterWallet>): Promise<ITransporterWallet> {
        try {

            return await this.model.create(walletData)
            
        } catch (error) {
            throw new Error( error instanceof Error ? error.message : String(error))
        }
    }

    async addMoneyInWallet(transporterId: string, amount: string): Promise<ITransporterWallet | null> {
        try {

            const numericAmount = parseFloat(amount)

            return await this.model.findOneAndUpdate(
                {transporterId: transporterId}, 
                { $inc: {balance: numericAmount}},
                {new: true}
            )
            
        } catch (error) {
            throw new Error (`Error in add money wallet ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async decrementMoneyInWallet (transporterId: string, amount: number): Promise<ITransporterWallet | null>  {
        try {
            

            return await this.model.findOneAndUpdate(
                {transporterId: transporterId, balance: { $gte: amount }},
                { $inc: {balance: -amount}},
                {new: true}
            )

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }
}

export default new TransporterWalletRepositroy();
