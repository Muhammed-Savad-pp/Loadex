
export interface MessageFotTransporter {
    _id: string,
    chatId: {
        lastMessage: string | null;
        transporterId: string;
        shipperId: string;
        _id: string;
    };
    isRead: boolean;
    message: string;
    receiverId: string;
    senderId: string;
    timeStamp: Date;
}
