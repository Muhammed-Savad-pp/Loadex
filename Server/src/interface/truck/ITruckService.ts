import { TruckForShipperDTO } from "../../dtos/truck/response/truck.for.shipper.dto";
import { TruckDTO } from "../../dtos/truck/response/truck.for.transporter.dto";
import { RequestedTruckForAdminDTO } from "../../dtos/truck/response/truck.forAdmin.dto";
import { ITruck } from "../../models/TruckModel";


export interface ITruckService {
    findTrucks(id: string, status: string, page: number, limit: number): Promise<{trucks:TruckDTO[] | null; totalPages: number}>
    registerTruck (transporterId: string, truckData:{ vehicleNumber: string,  ownerName: string,ownerMobileNo: string,
        type: string, capacity: string, tyres: string, driverName: string, driverMobileNumber: string, currentLocation: string,
        from: string, to: string,selectedLocations:string[],currentLocationCoords: { lat:number, lng:number},
        fromCoords: { lat: number, lng: number },
        toCoords: { lat: number, lng: number }
        }, rcBook: Express.Multer.File, driverLicense: Express.Multer.File, truckImage: Express.Multer.File) : Promise<{success: boolean, message: string}>;
    updateTruckAvailable(formData: Partial<ITruck>, driverLicensefile?: Express.Multer.File) : Promise <{success: boolean, truckData?: TruckDTO, message: string}>;
    fetchActiveTrucks(transporterId: string): Promise<ITruck[] | null>
    updateTruck(updateData: Partial<ITruck>, truckImage?: Express.Multer.File): Promise<{success: boolean, message: string}>
    fetchTrucksForShipper(page: number, limit: number): Promise<{truckData: TruckForShipperDTO[] | null, totalPages: number}>;
    getRequestedTrucksForAdmin(): Promise<RequestedTruckForAdminDTO[]>;
    changeTruckVerificationStatusByAdmin(id: string, status:ITruck['verificationStatus'], rejectReason: string):Promise<string>;
}