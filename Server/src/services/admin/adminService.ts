import { IAdminService } from "../../interface/admin/IAdminService";
import { configDotenv } from "dotenv";
import { generateAcessToken, generateRefreshToken } from "../../utils/Token.utils";
import { ITransporter } from "../../models/TransporterModel";
import { ITransporterRepository } from "../../repositories/interface/ITransporterRepository";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { IShipper } from "../../models/ShipperModel";
import { IShipperRepository } from "../../repositories/interface/IShipperRepository";
import { ITruck } from "../../models/TruckModel";
import { ILoad } from "../../models/LoadModel";
import { ILoadRepository } from "../../repositories/interface/ILoadRepository";
import { ITruckRepository } from "../../repositories/interface/ITruckRepository";

configDotenv()


export class AdminService implements IAdminService {

    constructor(
        private _transporterRepository: ITransporterRepository,
        private _shipperRepository: IShipperRepository,
        private _loadRepository: ILoadRepository,
        private _truckRepository: ITruckRepository
    ){}

    async login(email: string, passwrod: string): Promise<{ accessToken?: string, refreshToken?: string, success: boolean, message: string }> {
        try {

            console.log(email, 'ema');
            console.log(passwrod, 'password');
            console.log(process.env.ADMIN_EMAIL );
            console.log(process.env.ADMIN_PASSWORD);
            

            if(email != process.env.ADMIN_EMAIL || passwrod != process.env.ADMIN_PASSWORD) {
                console.log('dasdfsdf');
                
                return {success: false, message: 'Invalid Crendential'}
                 
            }

            const accessToken = await generateAcessToken(email as string, 'admin');
            const refreshToken = await generateRefreshToken(email as string, 'admin')

            return {accessToken: accessToken, refreshToken: refreshToken , success: true, message: 'Admin login successFully'}

            
        } catch (error) {
            console.log(error)
            throw new Error(error instanceof Error ? error.message : 'Unknow Error')
        }
    }

    async getTransporter(): Promise<ITransporter[]> {
        try {

            return this._transporterRepository.getTransporter();
            
        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : 'unknown error')
        }
    }

    async updateTransporterBlockandUnblock(id: string): Promise<string> {
        try {

            const transporter = await this._transporterRepository.findTransporterById(id);
            console.log(transporter, 'transport')

            if(!transporter) {
                const error : any = new Error('Transporter not found');
                error.status = HTTP_STATUS.NOT_FOUND;
                throw error
            }

            const updateTransporter = await this._transporterRepository.updateTransporterStatus(id, !transporter.isBlocked as boolean)

            return updateTransporter?.isBlocked ? 'Blocked Successfully' : 'UnblockSuccessFully'

        } catch (error: any) {
            console.log('error in updateTransporterStatus');
            throw new Error(error)
        }
    }

    async getRequestedTransporter(): Promise<ITransporter[]> {
        try {
            
            return await this._transporterRepository.getRequestedTransporter()

        } catch (error: any) {
            console.error('error in getRequestedTransporter');
            throw new Error(error)
        }
    }

    async changeVerificationStatus(id: string, status: ITransporter['verificationStatus']): Promise<string> {
        try {
            
            const transporter = await this._transporterRepository.updateTransporterById(id,{verificationStatus: status} );
            return status === 'approved' ? 'Request Approved.' : 'Request Reject.'

        } catch (error: any) {
            console.error('error in changeVerificatonStaus');
            throw new Error(error)
        }
    }

    async getShipper(): Promise<IShipper[]> {
        try {
            
            return await this._shipperRepository.getShipper()

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async changeShipperStatus(id: string): Promise<string> {
        try {

            const shipper = await this._shipperRepository.findShipperById(id);
            
            if(!shipper){
                const error : any = new Error('Shipper not found');
                error.status = HTTP_STATUS.NOT_FOUND;;
                throw error
            }

            const updateShipper = await this._shipperRepository.updateShipperStatus(id, !shipper.isBlocked as boolean)

            return updateShipper?.isBlocked ? 'Blocked' : 'Unblocked';
            
        } catch (error) {
            throw new Error(error instanceof Error ? error.message: String(error))
        }
    }

    async getRequestedShipper(): Promise<IShipper[]> {
        try {
            
            return await this._shipperRepository.getRequestedShipper()

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async changeShipperVerificationStatus(id: string, status: IShipper["verificationStatus"]): Promise<string> {
        try {
            
            const shipper = await this._shipperRepository.updateShipperById(id, {verificationStatus:status});
            return shipper?.verificationStatus === 'approved' ? 'Request Approved' : 'Request Rejected';

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async getRequestedTrucks(): Promise<ITruck[]> {
        try {
            
            return await this._truckRepository.getRequestedTrucks();
        
        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async changeTruckVerificationStatus(id: string, status: ITruck["verificationStatus"]): Promise<string> {
        try {
            
            const truck = await this._truckRepository.updateTruckById(id, {verificationStatus: status});
            return truck?.verificationStatus === 'approved' ? 'Request Approve' : 'Request Reject';

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async getLoads(): Promise<ILoad[] | null> {
        try {

            const projection = {
                material:1,
                quantity:1,
                transportationRent: 1,
                createdAt: 1,
            }

            const filter = {}
            
            const response = await this._loadRepository.getLoads(filter, []);            
            return response;

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

}

