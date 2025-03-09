import { IAdminService } from "../../interface/admin/IAdminService";
import { configDotenv } from "dotenv";
import { generateAcessToken, generateRefreshToken } from "../../utils/Token.utils";
import { ITransporter } from "../../models/transporter/TransporterModel";
import { ITransporterRepository } from "../../repositories/interface/ITransporterRepository";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { IShipper } from "../../models/shipper/ShipperModel";
import { IShipperRepository } from "../../repositories/interface/IShipperRepository";

configDotenv()


export class AdminService implements IAdminService {

    constructor(
        private transporterRepository: ITransporterRepository,
        private shipperRepository: IShipperRepository
    ){}

    async login(email: string, passwrod: string): Promise<{ accessToken: string; refreshToken: string; }> {
        try {

            if(email != process.env.ADMIN_EMAIL && passwrod != process.env.ADMIN_PASSWORD) {
                throw new Error('Invalid Credential')
            }

            const accessToken = await generateAcessToken(email as string, 'admin');
            const refreshToken = await generateRefreshToken(email as string, 'admin')

            return {accessToken, refreshToken}

            
        } catch (error) {
            console.log(error)
            throw new Error(error instanceof Error ? error.message : 'Unknow Error')
        }
    }

    async getTransporter(): Promise<ITransporter[]> {
        try {

            return this.transporterRepository.getTransporter();
            
        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : 'unknown error')
        }
    }

    async updateTransporterBlockandUnblock(id: string): Promise<string> {
        try {

            const transporter = await this.transporterRepository.findTransporterById(id);
            console.log(transporter, 'transport')

            if(!transporter) {
                const error : any = new Error('Transporter not found');
                error.status = HTTP_STATUS.NOT_FOUND;
                throw error
            }

            const updateTransporter = await this.transporterRepository.updateTransporterStatus(id, !transporter.isBlocked as boolean)

            return updateTransporter?.isBlocked ? 'Blocked Successfully' : 'UnblockSuccessFully'

        } catch (error: any) {
            console.log('error in updateTransporterStatus');
            throw new Error(error)
        }
    }

    async getRequestedTransporter(): Promise<ITransporter[]> {
        try {
            
            return await this.transporterRepository.getRequestedTransporter()

        } catch (error: any) {
            console.error('error in getRequestedTransporter');
            throw new Error(error)
        }
    }

    async changeVerificationStatus(id: string, status: ITransporter['verificationStatus']): Promise<string> {
        try {
            
            const transporter = await this.transporterRepository.updateTransporterById(id,{verificationStatus: status} );
            return status === 'approved' ? 'Request Approved.' : 'Request Reject.'

        } catch (error: any) {
            console.error('error in changeVerificatonStaus');
            throw new Error(error)
        }
    }

    async getShipper(): Promise<IShipper[]> {
        try {
            
            return await this.shipperRepository.getShipper()

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async changeShipperStatus(id: string): Promise<string> {
        try {

            const shipper = await this.shipperRepository.findShipperById(id);
            
            if(!shipper){
                const error : any = new Error('Shipper not found');
                error.status = HTTP_STATUS.NOT_FOUND;;
                throw error
            }

            const updateShipper = await this.shipperRepository.updateShipperStatus(id, !shipper.isBlocked as boolean)

            return updateShipper?.isBlocked ? 'Blocked' : 'Unblocked';
            
        } catch (error) {
            throw new Error(error instanceof Error ? error.message: String(error))
        }
    }

    async getRequestedShipper(): Promise<IShipper[]> {
        try {
            
            return await this.shipperRepository.getRequestedShipper()

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async changeShipperVerificationStatus(id: string, status: IShipper["verificationStatus"]): Promise<string> {
        try {
            
            const shipper = await this.shipperRepository.updateShipperById(id, {verificationStatus:status});
            return shipper?.verificationStatus === 'approved' ? 'Request Approved' : 'Request Rejected';

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

}

