import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import io from 'socket.io-client';
import axios from 'axios';
import Header from './header';
import Sidebar from './Sidebar';

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date;
    senderName: string;
}

interface User {
    id: string;  // Changed from _id to id
    first_name: string;
    last_name: string;
    email: string;
    phonenumber: number;
    isAdmin: boolean;
    isVerifiedDriver?: boolean;
}

const Messages: React.FC = () => {
    const { userId, isAdmin } = useContext(AuthContext);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const socket = useRef<any>(null);

    useEffect(() => {
        console.log('Current auth context:', { userId, isAdmin });

        socket.current = io('http://localhost:3001', {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.current.on('connect', () => {
            console.log('Socket connected with ID:', socket.current.id);
        });

        socket.current.on('connect_error', (error: any) => {
            console.error('Socket connection error:', error);
        });

        socket.current.on('newMessage', (message: Message) => {
            console.log('New message received:', message);
            if ((message.senderId === userId && message.receiverId === selectedUser) ||
                (message.senderId === selectedUser && message.receiverId === userId)) {
                setMessages(prev => [...prev, message]);
            }
        });

        fetchUsers();

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [userId]);

    useEffect(() => {
        console.log('Selected user changed to:', selectedUser);
        if (selectedUser) {
            fetchMessages();
        }
    }, [selectedUser]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
            console.log('Raw users data:', response.data);

            // Validate each user object
            const validUsers = response.data.filter((user: User) => {
                if (!user.id) {  // Changed from _id to id
                    console.warn('Found user without id:', user);
                    return false;
                }
                return true;
            });

            const filteredUsers = validUsers.filter((user: User) => {
                // Don't show the current user in the list
                if (user.id === userId) {  // Changed from _id to id
                    return false;
                }

                if (isAdmin) {
                    // Admin sees drivers (non-admin users)
                    console.log(`Filtering user ${user.first_name}: isAdmin=${user.isAdmin}, showing=${!user.isAdmin}`);
                    return !user.isAdmin;
                } else {
                    // Driver sees admins
                    console.log(`Filtering user ${user.first_name}: isAdmin=${user.isAdmin}, showing=${user.isAdmin}`);
                    return user.isAdmin;
                }
            });

            console.log('Current user is admin:', isAdmin);
            console.log('Filtered users result:', filteredUsers);
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        }
    };


    const handleUserSelect = (selectedUserId: string) => {
        console.log('User ID to be selected:', selectedUserId);

        if (!selectedUserId || !userId) {
            console.error('Invalid selection:', { selectedUserId, userId });
            return;
        }

        const userExists = users.some(user => user.id === selectedUserId);
        if (!userExists) {
            console.error('Selected user not found in users list');
            return;
        }

        console.log('Setting selected user to:', selectedUserId);
        setSelectedUser(selectedUserId);
    };

    const fetchMessages = async () => {
        if (!selectedUser || !userId) {
            console.log('Missing required IDs for fetching messages:', { selectedUser, userId });
            return;
        }

        try {
            console.log('Fetching messages between:', { userId, selectedUser });
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/messages/${userId}/${selectedUser}`
            );
            console.log('Messages received:', response.data);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || !userId) {
            console.log('Cannot send message:', {
                hasMessage: Boolean(newMessage.trim()),
                hasSelectedUser: Boolean(selectedUser),
                hasUserId: Boolean(userId)
            });
            return;
        }

        try {
            console.log('Sending message to:', selectedUser);
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages`, {
                senderId: userId,
                receiverId: selectedUser,
                content: newMessage,
            });

            console.log('Message sent successfully:', response.data);
            socket.current.emit('sendMessage', response.data);
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleSidebarToggle = (collapsed: boolean) => {
        setIsSidebarCollapsed(collapsed);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex min-h-screen bg-gray-800">
            <Sidebar
                onToggle={handleSidebarToggle}
                isDriver={!isAdmin}
            />
            <div className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
                <Header sidebarCollapsed={isSidebarCollapsed} />

                <div className="flex" style={{ height: 'calc(100vh - 80px)', marginTop: '80px' }}>
                    {/* Users list */}
                    <div className="divide-y divide-gray-700">
                        {users.length > 0 ? (
                            users.map(user => (
                                <div
                                    key={user.id}  // Changed from _id to id
                                    onClick={() => {
                                        console.log('Clicked user:', user);
                                        console.log('User ID:', user.id);  // Changed from _id to id
                                        handleUserSelect(user.id);  // Changed from _id to id
                                    }}
                                    className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200
                    ${selectedUser === user.id ? 'bg-gray-700' : 'bg-transparent'}`}  // Changed from _id to id
                                >
                                    <p className="text-white font-medium">
                                        {`${user.first_name} ${user.last_name}`}
                                    </p>
                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-gray-400 text-center">
                                Loading users...
                            </div>
                        )}
                    </div>


                    {/* Messages area */}
                    <div className="flex-1 flex flex-col bg-gray-800">
                        {selectedUser ? (
                            <>
                                {/* Selected user header */}
                                <div className="bg-gray-900 p-4 border-b border-gray-700 sticky top-0 z-10">
                                    <h3 className="text-white font-medium">
                                        {selectedUser ?
                                            `${users.find(user => user.id === selectedUser)?.first_name || ''} 
                                             ${users.find(user => user.id === selectedUser)?.last_name || ''}`
                                            : 'Selected User'}
                                    </h3>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length > 0 ? (
                                        messages.map(message => (
                                            <div
                                                key={message._id}
                                                className={`flex ${
                                                    message.senderId === userId
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-lg p-3 ${
                                                        message.senderId === userId
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-700 text-white'
                                                    }`}
                                                >
                                                    <p className="break-words">{message.content}</p>
                                                    <p className="text-xs text-gray-300 mt-1">
                                                        {new Date(message.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            No messages yet
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message input */}
                                <div className="p-4 bg-gray-900 border-t border-gray-700">
                                    <form onSubmit={sendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                                            placeholder="Type a message..."
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Send
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                Select a user to start messaging
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;