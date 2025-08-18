import { BidForShipperDTO } from "../../dtos/bids/bid.for.shipper.dto";
import { BidForTransporterDTO } from "../../dtos/bids/bid.for.transporter.dto";
import { IBid } from "../../models/BidModel";


export interface IBidService {
    createBid(formData: {truckNo: string, rent: string, loadId: string, shipperId: string}, transporterId: string): Promise<{success: boolean, message: string}>;
    fetchBidsForTransporter(transporterid: string, page: number, limit: number, status: string): Promise<{ bidDatas: BidForTransporterDTO[] | null, totalPages: number}>
    updateBid(bidId: string, truckId: string, price: string): Promise<{success: boolean, message: string, updateBid?: BidForTransporterDTO}>
    deleteBidById(bidId: string): Promise<{success: boolean, message: string, BidData?: IBid}>;
    fetchBidsForShipper(id: string, page: number, limit: number, status: string): Promise<{bidData: BidForShipperDTO[] | null, totalPages: number}>
    updateBidStatusByShipper(bidId: string, status: string): Promise<{success: boolean , message: string}>;
}