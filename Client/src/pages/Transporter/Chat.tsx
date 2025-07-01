import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, MoreVertical, Search, ArrowLeft, CheckCheck } from 'lucide-react';
import Navbar from '../../components/Common/Navbar/Navbar';
import { fetchChats, fetchCurrentTransporterId, fetchMessages } from '../../services/transporter/transporterApi';
import socket from '../../socket';


interface IChat {
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

interface IMessage {
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

const Chat: React.FC = () => {
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [chats, setChats] = useState<IChat[]>([])
    const [selectedUser, setSelectedUser] = useState<IChat | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const getChatData = async () => {
            try {

                const transporterId: any = await fetchCurrentTransporterId();
                if (transporterId) {
                    setCurrentUserId(transporterId.transporterId)
                }


                const response: any = await fetchChats();
                setChats(response as IChat[]);

                console.log(response, 'res');


            } catch (error) {
                console.error("Failed to fetch Chat", error)
            }
        }

        getChatData()
    }, [])

    useEffect(() => {
        if (!currentUserId) return;

        socket.emit("join", currentUserId);

        // ✅ Use a named function so we can remove it later
        // const handleReceiveMessage = (newMessage: IMessage) => {
        //     console.log("incoming:", newMessage.chatId, selectedUser?._id);

        //     const messageChatId =
        //         typeof newMessage.chatId === "string"
        //             ? newMessage.chatId
        //             : newMessage.chatId._id;

        //     if (messageChatId === selectedUser?._id) {
        //         setMessages((prev) => [...prev, newMessage]);

        //         if (!newMessage.isRead && newMessage.receiverId === currentUserId) {
        //             socket.emit("mark-read", {
        //                 messageId: newMessage._id,
        //                 senderId: newMessage.senderId,
        //             });
        //         }
        //     }
        // };

        const handleReceiveMessage = (newMessage: IMessage) => {
            const messageChatId =
                typeof newMessage.chatId === "string"
                    ? newMessage.chatId
                    : newMessage.chatId._id;

            // 1. Update the chat list to reflect the new last message and unread count
            setChats(prevChats =>
                prevChats.map(chat => {
                    if (chat._id === messageChatId) {
                        const updatedChat = { ...chat };

                        updatedChat.lastMessage = newMessage.message;

                        // Increase unread count if not currently selected
                        if (selectedUser?._id !== messageChatId) {
                            updatedChat.unreadCount = (chat.unreadCount || 0) + 1;
                        }

                        return updatedChat;
                    }
                    return chat;
                })
            );

            // 2. If the message belongs to the currently selected chat, show it
            if (messageChatId === selectedUser?._id) {
                setMessages(prev => [...prev, newMessage]);

                // 3. Optionally emit read status for that message if it's for current user
                if (!newMessage.isRead && newMessage.receiverId === currentUserId) {
                    socket.emit("mark-read", {
                        messageId: newMessage._id,
                        senderId: newMessage.senderId,
                    });
                }
            }
        };

        const handleOnlineUsers = (userIds: string[]) => {
            setOnlineUsers(userIds);
        };

        const handleMessageRead = (updatedMessage: IMessage) => {
            // Update local state to reflect read status
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === updatedMessage._id ? updatedMessage : msg
                )
            );
        };

        socket.on("receive-message", handleReceiveMessage);
        socket.on("online-users", handleOnlineUsers);
        socket.on("message-read", handleMessageRead);

        return () => {
            socket.off("receive-message", handleReceiveMessage);
            socket.off("online-users", handleOnlineUsers);
            socket.off("message-read", handleMessageRead);
        };
    }, [currentUserId, selectedUser?._id]);

    useEffect(() => {
        if (selectedUser?._id) {
            // Reset unread count in UI
            setChats(prevChats =>
                prevChats.map(chat => {
                    if (chat._id === selectedUser._id) {
                        return { ...chat, unreadCount: 0 };
                    }
                    return chat;
                })
            );

            // Emit to backend to mark all as read
            socket.emit("mark-chat-read", {
                chatId: selectedUser._id,
                receiverId: currentUserId,
            });
        }
    }, [selectedUser?._id]);


    // useEffect(() => {
    //     if (!currentUserId) return;

    //     socket.emit('registerUser', currentUserId);
    //     socket.emit('userConnected', currentUserId);

    //     return () => {
    //         socket.disconnect();
    //     };
    // }, [currentUserId]);

    // useEffect(() => {
    //     const handleConnect = () => {
    //         if (currentUserId) {
    //             socket.emit('registerUser', currentUserId);
    //             socket.emit('userConnected', currentUserId);
    //         }
    //     };

    //     if (socket.connected) {
    //         handleConnect();
    //     } else {
    //         socket.on('connect', handleConnect);
    //     }

    //     return () => {
    //         socket.off('connect', handleConnect);
    //     };
    // }, [currentUserId]);


    // useEffect(() => {
    //     socket.on("onlineUsers", (userIds: string[]) => {
    //         setOnlineUsers(userIds);
    //     });

    //     return () => {
    //         socket.off("onlineUsers");
    //     };
    // }, []);



    // useEffect(() => {
    //     console.log('online');

    //     socket.on("userOnline", (userId: string) => {
    //         setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    //     });

    //     socket.on("userOffline", (userId: string) => {
    //         setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    //     });

    //     return () => {
    //         socket.off("userOnline");
    //         socket.off("userOffline");
    //     };
    // }, []);



    useEffect(() => {
        const getMessages = async () => {
            if (!selectedUser) return
            try {

                const response = await fetchMessages(selectedUser?._id as string);
                const messageList = response as IMessage[]
                setMessages(response as IMessage[]);

                messageList.forEach(msg => {
                    if (!msg.isRead && msg.receiverId === currentUserId) {
                        socket.emit("mark-read", {
                            messageId: msg._id,
                            senderId: msg.senderId,
                        });
                    }
                });

            } catch (error) {
                console.error('error in fetchMessages', error)
            }
        }

        getMessages()
    }, [selectedUser])


    // useEffect(() => {
    //     if (selectedUser && currentUserId) {
    //         socket.emit('joinRoom', selectedUser._id);

    //         // ✅ Notify server that current user is active again
    //         socket.emit('userConnected', currentUserId);

    //         const markMessageAsRead = async () => {
    //             try {
    //                 await updateMessageAsRead(selectedUser._id);
    //             } catch (error) {
    //                 console.error(error);
    //             }
    //         };

    //         markMessageAsRead();
    //     }
    // }, [selectedUser, currentUserId]);



    // useEffect(() => {
    //     socket.on('receiveMessage', (message) => {
    //         setMessages((prevMessages) => [...prevMessages, message]);
    //     });

    //     return () => {
    //         socket.off('receiveMessage');
    //     };
    // }, []);



    // useEffect(() => {
    //     if (!selectedUser || !currentUserId) {
    //         console.log("Missing selectedUser or currentUserId");
    //         return;
    //     }

    //     if (!messages.length) {
    //         console.log("No messages yet, skipping messageSeen emit");
    //         return;
    //     }

    //     const unseenMessages = messages.filter(
    //         (msg) => msg.receiverId === currentUserId && !msg.isRead
    //     );

    //     unseenMessages.forEach((msg) => {
    //         socket.emit('messageSeen', {
    //             messageId: msg._id,
    //             chatId: selectedUser._id,
    //         });
    //     });
    // }, [messages, selectedUser, currentUserId]);

    // useEffect(() => {
    //     socket.on('messageSeenUpdate', (updatedMessage: IMessage) => {
    //         setMessages((prevMessages) =>
    //             prevMessages.map((msg) =>
    //                 msg._id === updatedMessage._id ? updatedMessage : msg
    //             )
    //         );
    //     });

    //     return () => {
    //         socket.off('messageSeenUpdate');
    //     };
    // }, []);

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedUser]);

    const handleSendMessage = async () => {
       

        if (!newMessage.trim() || !selectedUser) return;

        const receiverId =
            selectedUser.shipperId?._id

        socket.emit("send-message", {
            chatId: selectedUser._id,
            senderId: currentUserId,
            receiverId,
            message: newMessage.trim(),
        });

        setNewMessage("");
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleUserSelect = (user: IChat): void => {
        setSelectedUser(user);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(e.target.value);
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setNewMessage(e.target.value);
    };

    console.log(chats)

    return (
        <>
            <Navbar />
            <div className="flex h-screen bg-gray-50 pt-16">
                {/* Left Sidebar - User List */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    {/* Search Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    {/* User List */}
                    <div className="flex-1 overflow-y-auto">
                        {chats.map((user, i) => (

                            <div

                                key={i}
                                onClick={() => handleUserSelect(user)}
                                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedUser?.shipperId._id === user.shipperId._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                    }`}
                            >

                                <div className="relative">
                                    <img
                                        src={user.shipperId.profileImage}
                                        alt={user.shipperId.shipperName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    {onlineUsers.includes(user?.shipperId._id) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium text-gray-900 truncate">{user.shipperId.shipperName}</h3>
                                        {/* <span className="text-xs text-gray-500">{user.time}</span> */}
                                    </div>
                                    <p className="text-sm text-gray-600 truncate mt-1">{user.lastMessage}</p>
                                </div>
                                {user.unreadCount > 0 && (
                                    <div className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {user.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <button className="lg:hidden mr-3">
                                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <img
                                        src={selectedUser.shipperId.profileImage}
                                        alt={selectedUser.shipperId.shipperName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="ml-3">
                                        <h3 className="font-medium text-gray-900">{selectedUser.shipperId.shipperName}</h3>
                                        <p className="text-sm text-gray-500">
                                            {onlineUsers.includes(selectedUser.shipperId._id) ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                        <Video className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.map((msg: IMessage) => {
                                    const isSender = msg.senderId === currentUserId;
                                    return (
                                        <div
                                            key={msg._id}
                                            className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow-sm ${isSender
                                                    ? 'bg-[#c5e9aa] text-black'
                                                    : 'bg-[#F0F0F0] text-black'
                                                    }`}
                                            >
                                                <p className="text-sm">{msg.message}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-[0.7rem] text-gray-600">
                                                        {new Date(msg.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {isSender && (
                                                        <span className="ml-2 flex items-center gap-1">
                                                            {msg.isRead ? (
                                                                <CheckCheck size={16} className="text-blue-500" />
                                                            ) : (
                                                                <CheckCheck size={16} className="text-gray-400" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="bg-white border-t border-gray-200 p-4">
                                <div className="flex items-end space-x-3">
                                    {/* <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                        <Paperclip className="w-5 h-5" />
                                    </button> */}
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={newMessage}
                                            onChange={handleMessageChange}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type a message..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows={1}
                                            style={{ minHeight: '40px', maxHeight: '120px' }}
                                        />
                                    </div>
                                    {/* <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                        <Smile className="w-5 h-5" />
                                    </button> */}
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                                        disabled={!newMessage.trim()}
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Welcome Screen */
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-10 h-10 text-gray-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Chat</h2>
                                <p className="text-gray-500">Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Chat;