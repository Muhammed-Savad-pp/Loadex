import { BidLoadDTO, BidTruckDTO } from "./bid.common.dto";


export interface BidShipperDTO {
  _id: string;
  shipperName: string;
  profileImage: string;
}

export interface BidForTransporterDTO {
  _id: string;
  shipperId: BidShipperDTO;
  transporterId: string;
  loadId: BidLoadDTO;
  truckId: BidTruckDTO;
  price: string;
  status: string;
  createAt: Date;
  shipperPayment: boolean;
  transporterPayment: boolean;
}