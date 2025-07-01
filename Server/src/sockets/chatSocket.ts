// import { Server, Socket } from "socket.io";
import Message from "../models/Message";
import Chat from "../models/Chat";

// interface MessagePayload {
//     chatId: string;
//     senderId: string;
//     receiverId: string;
//     message: string;
// }



// export const registerChatSocket = (io: Server) => {

//     const connectedUsers = new Map();

//     io.on('connection', (socket: Socket) => {
//         console.log('User connected', socket.id);

//         socket.on('registerUser', (userId: string) => {
//             socket.join(userId); // Register user to their personal room
//             console.log(`User ${userId} registered to personal room`);
//         });


//         socket.on('joinRoom', (chatId: string) => {
//             socket.join(chatId);
//             console.log(`User joined chat room: ${chatId}`)
//         });

//         socket.on('sendMessage', async (payload: MessagePayload) => {
//             const { chatId, message, senderId, receiverId } = payload;

//             try {
//                 const newMessage = await Message.create({
//                     chatId,
//                     senderId,
//                     receiverId,
//                     message,
//                     isRead: false,
//                     timeStamp: new Date(),
//                 });

//                 io.to(chatId).emit('receiveMessage', newMessage);
//             } catch (err) {
//                 console.error("Error saving message", err);
//             }
//         });

//         socket.on("messageSeen", async ({ messageId, chatId }) => {
//             try {

//                 const updatedMessage = await Message.findByIdAndUpdate(
//                     messageId,
//                     { isRead: true },
//                     { new: true }
//                 );

//                 if (updatedMessage) {
//                     // Notify other side
//                     io.to(chatId).emit("messageSeenUpdate", updatedMessage);

//                     // ALSO emit directly to the sender if needed
//                     io.to(updatedMessage.senderId.toString()).emit("messageSeenUpdate", updatedMessage);

//                 }
//             } catch (err) {
//                 console.error("Error updating seen status", err);
//             }
//         });

//         socket.on('userConnected', (userId) => {
//             connectedUsers.set(userId, socket.id);

//             const currentlyOnlineUserIds = Array.from(connectedUsers.keys());

//             // ✅ Notify just the current user of full list
//             socket.emit('onlineUsers', currentlyOnlineUserIds);

//             // ✅ Notify all other users about this user's online status
//             socket.broadcast.emit('userOnline', userId);

//             // ✅ Notify everyone (including the one who triggered) of the full list
//             io.emit('onlineUsers', currentlyOnlineUserIds);

//             console.log(`${userId} is now online`);
//         });


//         socket.on('disconnect', () => {
//             const userId = [...connectedUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
//             if (userId) {
//                 connectedUsers.delete(userId);
//                 socket.broadcast.emit('userOffline', userId);

//                 io.emit('onlineUsers', [...connectedUsers.keys()]);
//                 console.log(`${userId} disconnected`);

//             }
//         })

//         socket.on('disconnect', () => {
//             console.log('User disconnected', socket.id);
//         })

//     })

// }


import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

interface ISocketUser {
    userId: string;
    socketId: string;
}

const connectedUsers: ISocketUser[] = [];

export const setupSocket = (server: HTTPServer) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: "http://localhost:5173",
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