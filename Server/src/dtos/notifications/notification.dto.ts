

export interface NotificationForTransporterDTO {
    _id: string;
    userId: string;
    userType: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

export interface NotificationForShipper {
  _id: string;
  userId: string;
  userType: 'shipper' | 'transporter';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}