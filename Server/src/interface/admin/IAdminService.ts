import { promises } from "dns";
import { IShipper } from "../../models/ShipperModel";
import { ITransporter } from "../../models/TransporterModel";
import { ITruck } from "../../models/TruckModel";
import { ILoad } from "../../models/LoadModel";
import { ITrip } from "../../models/TripModel";
import { AdminPaymentDTO } from "../../dtos/admin/admin.payment.history.dto";
import { TransporterForAdminDTO } from "../../dtos/transporter/transporter.dto";
import { ShipperForAdminDTO } from "../../dtos/shipper/shipper.dto";
import { TripForAdminDTO } from "../../dtos/trip/trip.for.transporter.dto";

export interface IAdminService {
    login(email: string, passwrod: string) : Promise<{accessToken?: string, refreshToken?: string, success: boolean, message: string}>;
    getTransporter(search: string, page: number, limit: number): Promise<{transporterData: TransporterForAdminDTO[], totalPages: number}>
    updateTransporterBlockandUnblock(id: string) : Promise<string>;
    getRequestedTransporter(): Promise<TransporterForAdminDTO[]>;
    changeVerificationStatus(id: string, status: ITransporter['verificationStatus']) : Promise<string>;
    getShipper(search: string, page: number , limit: number): Promise<{shipperData: ShipperForAdminDTO[], totalPages: number}>
    changeShipperStatus(id: string): Promise<string>;
    getRequestedShipper(): Promise<ShipperForAdminDTO[]>;
    changeShipperVerificationStatus(id: string, status: IShipper['verificationStatus']) : Promise<string>;
    getRequestedTrucks(): Promise<ITruck[]>;
    changeTruckVerificationStatus(id: string, status:ITruck['verificationStatus']):Promise<string>;
    getLoads(page: number, limit: number, search: string, startDate: string, endDate: string): Promise<{loadData: ILoad[] | null, totalPages: number}>;
    fetchDashboardDatas(): Promise<{userCount: number, loadCount: number, tripCount: number, totalEarning: number}>
    fetchTrips(page: number, limit: number, search: string, status: string): Promise<{tripsData: TripForAdminDTO[], totalPages: number}>;
    sendTripAmountToTransporter(tripId: string): Promise<{success: boolean, message: string}>;
    fetchPaymentHistory(searchTerm: string, paymentStatus: string, userType: string, paymentfor: string, page: number, limit: number): Promise<{paymentData: AdminPaymentDTO[] | null, totalPages: number}>;
    fetchRevenueDatas(): Promise<{ success: boolean; categories: string[]; data: number[] }>
}

