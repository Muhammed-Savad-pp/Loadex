// import { Server, Socket } from "socket.io";
import Message from "../models/Message";
import Chat from "../models/Chat";
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import config from "../config";

interface ISocketUser {
    userId: string;
    socketId: string;
}

const connectedUsers: ISocketUser[] = [];

export const setupSocket = (server: HTTPServer) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: config.frontEndUrl,
            methods: ["GET", "POST"],
            credentials: true
        },
    });


    io.on("connection", (socket: Socket) => {
        console.log("New user connected:", socket.id);

        // When a user connects, store their userId + socketId
        socket.on("join", (userId: string) => {

            (socket as any).userId = userId;
            if (!connectedUsers.some(user => user.userId === userId)) {
                connectedUsers.push({ userId, socketId: socket.id });
                console.log("User joined:", userId);
            }
            io.emit('online-users', connectedUsers.map(user => user.userId));

        });

        // Handle message sending
        socket.on("send-message", async (data) => {
            const { chatId, senderId, receiverId, message } = data;

            // 1. Save message to DB
            const newMessage = await Message.create({
                chatId,
                senderId,
                receiverId,
                message,
            });

            // 2. Update last message in chat
            await Chat.findByIdAndUpdate(chatId, {
                lastMessage: message,
                updatedAt: new Date()
            });

            // 3. Emit to receiver (if connected)
            const receiverSocket = connectedUsers.find(u => u.userId === receiverId);
            if (receiverSocket) {
                io.to(receiverSocket.socketId).emit("receive-message", newMessage);
            }

            // 4. Also emit to sender to update own chat window
            socket.emit("receive-message", newMessage);
        });

        socket.on("mark-chat-read", async ({ chatId }) => {
            const userId = (socket as any).userId;
            if (!userId) return;

            // 1. Update messages
            const updatedMessages = await Message.updateMany(
                { chatId, receiverId: userId, isRead: false },
                { isRead: true }
            );

            // 2. Optionally notify sender(s) that messages were seen
            const allReadMessages = await Message.find({
                chatId,
                receiverId: userId,
                isRead: true,
            });

            for (const msg of allReadMessages) {
                const senderSocket = connectedUsers.find(u => u.userId === msg.senderId);
                if (senderSocket) {
                    io.to(senderSocket.socketId).emit("message-read", msg); // 🔁 Real-time update
                }
            }
        });



        // Handle message read status
        socket.on("mark-read", async ({ messageId, senderId }) => {
            const updatedMessage = await Message.findByIdAndUpdate(
                messageId,
                { isRead: true, },
                { new: true }
            );

            // Optionally notify the sender
            const senderSocket = connectedUsers.find(u => u.userId === senderId);
            if (senderSocket && updatedMessage) {
                io.to(senderSocket.socketId).emit("message-read", updatedMessage);
            }
        });

        // Disconnect cleanup
        socket.on("disconnect", () => {
            const index = connectedUsers.findIndex(u => u.socketId === socket.id);
            if (index !== -1) {
                connectedUsers.splice(index, 1);
                console.log("User disconnected:", socket.id);
            }
            io.emit('online-users', connectedUsers.map(user => user.userId));

        });
    });
};