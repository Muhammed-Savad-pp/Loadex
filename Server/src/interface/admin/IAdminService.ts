import { promises } from "dns";
import { IShipper } from "../../models/ShipperModel";
import { ITransporter } from "../../models/TransporterModel";
import { ITruck } from "../../models/TruckModel";
import { ILoad } from "../../models/LoadModel";

export interface IAdminService {
    login(email: string, passwrod: string) : Promise<{accessToken?: string, refreshToken?: string, success: boolean, message: string}>;
    getTransporter(): Promise<ITransporter[]>;
    updateTransporterBlockandUnblock(id: string) : Promise<string>;
    getRequestedTransporter(): Promise<ITransporter[]>;
    changeVerificationStatus(id: string, status: ITransporter['verificationStatus']) : Promise<string>;
    getShipper(): Promise<IShipper[]>;
    changeShipperStatus(id: string): Promise<string>;
    getRequestedShipper(): Promise<IShipper[]>;
    changeShipperVerificationStatus(id: string, status: IShipper['verificationStatus']) : Promise<string>;
    getRequestedTrucks(): Promise<ITruck[]>;
    changeTruckVerificationStatus(id: string, status:ITruck['verificationStatus']):Promise<string>;
    getLoads():Promise<ILoad[] | null>;
}

