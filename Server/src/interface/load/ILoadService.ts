import { LoadForAdminDTO, LoadForShipperDTO, LoadForTransporterDTO } from "../../dtos/load/load.dto";
import { ILoad } from "../../models/LoadModel";

export interface ILoadService {
    createLoad(shipperId: string, formData: Partial<ILoad>) : Promise<{success: boolean, message: string}>;
    getShipperLoads(shipperId: string, page: number, limit: number): Promise<{loads: LoadForShipperDTO[] | null, totalPages: number}> 
    updateLoad(formData: Partial<ILoad>): Promise<{success: boolean, message: string, updateData?: LoadForShipperDTO}>
    deleteLoadByLoadId(loadId: string): Promise<{success: boolean, message: string, loadData?: LoadForShipperDTO }>;
    loadsForAdmin(page: number, limit: number, search: string, startDate: string, endDate: string): Promise<{loadData: LoadForAdminDTO[] | null, totalPages: number}>;
    loadsForTransporter(page: number, limit: number): Promise<{loads: LoadForTransporterDTO[] | null, currentPage: number, totalPages: number, totalItems: number}>
}