import { IBid } from "../../models/BidModel";
import { ILoad } from "../../models/LoadModel";
import { ITransporter } from "../../models/TransporterModel";
import { ITruck } from "../../models/TruckModel";
import { IBaseRepository } from "./IBaseRepository";


export interface ITransporterRepository extends IBaseRepository<ITransporter>  {

    createTransporter(data: Partial<ITransporter> ) : Promise<ITransporter | null>;
    findTransporterByEmail(email: string) : Promise <ITransporter | null>;
    verifyTransporter(email: string, isVerified: boolean): Promise<ITransporter | null>;
    findTransporterById(id: string): Promise<ITransporter | null>;
    updateTransporterById(transporterId: string, transporterData: Partial<ITransporter>) : Promise<ITransporter | null>;
    getTransporter(): Promise<ITransporter[]>;
    updateTransporterStatus(id: string, isBlocked: boolean) : Promise<ITransporter | null >;
    getRequestedTransporter(): Promise<ITransporter[]>;

}