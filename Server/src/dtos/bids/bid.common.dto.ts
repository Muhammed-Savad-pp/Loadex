

export interface BidTruckDTO {
    _id: string;
    truckNo: string;
    truckType: string;
    capacity: string;
    truckImage: string;
}

export interface BidLoadDTO {
  _id: string;
  pickupLocation: string;
  dropLocation: string;
  material: string;
  quantity: string;
  scheduledDate: Date;
}
