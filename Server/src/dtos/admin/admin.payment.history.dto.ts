
export interface AdminPaymentTripDTO {
    _id: string,
}

export interface AdminPaymentBidDTO {
    _id: string
}


export interface AdminPaymentDTO {
  transactionId: string;
  userType: string;
  userId: string;
  amount: number;
  tripId?:string ;  
  transactionType: string;
  paymentFor: string;
  bidId?: string;   
  subscriptionId: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}
