

export interface ChatForShipperDTO {
    _id: string
    shipperId: string;
    transporterId: {
        _id: string;
        transporterName: string;
        profileImage: string;
    };
    lastMessage: string | null;
    unreadCount: number
}

export interface ChatForTransporterDTO {
    _id: string
    shipperId: {
        _id: string;
        shipperName: string;
        profileImage: string;
    };
    transporterId: string;
    lastMessage: string | null;
    unreadCount: number
}