import { ITransporter } from "../../models/transporter/TransporterModel";

export interface ITransporterService {
    verificationStatus (id: string) : Promise<{success: boolean, message: string, verificationStatus?: string}>;
    getProfileData (id: string) : Promise<{success: boolean, message: string, transporterData?: Partial<ITransporter>}>;
    kycVerification (transporterId : string, panNumber: string, aadhaarFront?: Express.Multer.File , aadhaarBack?: Express.Multer.File) : Promise<{success: boolean, message: string, transporterData?: Partial<ITransporter>}>;
    registerTruck (transporterId: string, truckData:{ vehicleNumber: string,  ownerName: string,ownerMobileNo: string,
        type: string, capacity: string, tyres: string, driverName: string, driverMobileNumber: string, currentLocation: string,
        from: string, to: string,selectedLocations:string[]
        }, rcBook: Express.Multer.File, driverLicense: Express.Multer.File) : Promise<{success: boolean, message: string}>;
    
}