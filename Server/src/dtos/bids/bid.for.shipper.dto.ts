import { BidTruckDTO, BidLoadDTO } from './bid.common.dto';

export interface BidTransporterDTO {
  _id: string;
  transporterName: string;
  profileImage: string;
}

export interface BidForShipperDTO {
  _id: string;
  transporterId: BidTransporterDTO;
  shipperId: string;
  loadId: BidLoadDTO;
  truckId: BidTruckDTO;
  price: string;
  status: string;
  createAt: Date;
  shipperPayment: boolean;
  transporterPayment: boolean;
}
