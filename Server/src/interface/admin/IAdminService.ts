import { promises } from "dns";
import { IShipper } from "../../models/shipper/ShipperModel";
import { ITransporter } from "../../models/transporter/TransporterModel";

export interface IAdminService {
    login(email: string, passwrod: string) : Promise<{accessToken: string, refreshToken: string}>;
    getTransporter(): Promise<ITransporter[]>;
    updateTransporterBlockandUnblock(id: string) : Promise<string>;
    getRequestedTransporter(): Promise<ITransporter[]>;
    changeVerificationStatus(id: string, status: ITransporter['verificationStatus']) : Promise<string>;
    getShipper(): Promise<IShipper[]>;
    changeShipperStatus(id: string): Promise<string>;
    getRequestedShipper(): Promise<IShipper[]>;
    changeShipperVerificationStatus(id: string, status: IShipper['verificationStatus']) : Promise<string>;
}

