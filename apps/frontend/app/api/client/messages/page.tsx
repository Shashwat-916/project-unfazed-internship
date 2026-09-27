"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/context/useAuthContext";
import { useSocketContext } from "@/context/useSocketContext";
import { ConversationRoutes } from "@/services/conversationRoutes";
import { MessageRoutes } from "@/services/messageRoutes";
import { motion } from "framer-motion";
import { LoaderCircleIcon, SendIcon, UserIcon, ArrowLeftIcon } from "lucide-react";

export default function ClientMessagesPage() {
    const { token, user } = useAuthContext();
    const { socket, isConnected } = useSocketContext();

    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConversation, setActiveConversation] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const conversationRoutes = new ConversationRoutes(token || undefined);
    const messageRoutes = new MessageRoutes(token || undefined);

    useEffect(() => {
        if (!token) return;
        fetchConversations();
    }, [token]);

    useEffect(() => {
        if (!socket) return;
        
        const handleReceiveMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "new_message") {
                    setMessages(prev => [...prev, data.message]);
                }
            } catch (error) {
                console.error("Failed to parse websocket message", error);
            }
        };

        socket.addEventListener("message", handleReceiveMessage);
        return () => {
            socket.removeEventListener("message", handleReceiveMessage);
        };
    }, [socket]);

    const fetchConversations = async () => {
        setIsLoading(true);
        try {
            const res = await conversationRoutes.getMyConversations();
            if (res.success) {
                setConversations(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            const res = await messageRoutes.getMessages(conversationId);
            if (res.success) {
                setMessages(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const handleSelectConversation = (conv: any) => {
        setActiveConversation(conv);
        fetchMessages(conv.id);
    };



    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const content = newMessage;
        setNewMessage(""); // optimistic clear

        const tempId = Math.random().toString(36).substr(2, 9);
        const tempMsg = {
            id: tempId,
            conversationId: activeConversation.id,
            content,
            senderId: user?.id,
            createdAt: new Date().toISOString()
        };

        // 1. Optimistic UI update
        setMessages((prev) => [...prev, tempMsg]);

        // 2. Send via WebSocket if connected
        if (socket && isConnected) {
            socket.send(JSON.stringify({
                type: "chat",
                conversationId: activeConversation.id,
                content,
                recipientId: activeConversation.therapist?.userId // Assuming this gets the other user's ID
            }));
        } else {
            // Fallback to REST API
            try {
                await messageRoutes.sendMessage(activeConversation.id, content);
                fetchMessages(activeConversation.id);
            } catch (error) {
                console.error("Failed to send message via REST", error);
            }
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <LoaderCircleIcon className="size-12 animate-spin text-emerald-500" />
                <p className="text-slate-400 font-medium animate-pulse text-lg">Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto mt-8 sm:mt-12 px-4 sm:px-6 h-[80vh] flex gap-6 pb-12">
            
            {/* Conversations List Panel */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`w-full md:w-1/3 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white flex flex-col overflow-hidden ${activeConversation ? 'hidden md:flex' : 'flex'}`}
            >
                <div className="p-6 border-b border-slate-100 bg-emerald-500 text-white">
                    <h2 className="text-2xl font-bold font-serif">Messages</h2>
                    <p className="text-emerald-50 text-sm">Your conversations with therapists</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {conversations.length === 0 ? (
                        <p className="text-slate-400 text-center mt-10">No conversations yet.</p>
                    ) : (
                        conversations.map(conv => (
                            <div 
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border ${activeConversation?.id === conv.id ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center font-bold overflow-hidden shrink-0 border border-emerald-100">
                                        {conv.therapist?.profileImage ? (
                                            <img src={conv.therapist.profileImage} alt={conv.therapist?.user?.name || "Therapist"} className="object-cover w-full h-full" />
                                        ) : (
                                            conv.therapist?.user?.name?.charAt(0) || <UserIcon size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{conv.therapist?.user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate w-40">
                                            {conv.messages && conv.messages[0] ? conv.messages[0].content : "No messages yet"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Active Conversation Panel */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`w-full md:w-2/3 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white flex flex-col overflow-hidden ${!activeConversation ? 'hidden md:flex' : 'flex'}`}
            >
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 sm:p-6 border-b border-slate-100 bg-white flex items-center gap-4">
                            <button className="md:hidden p-2 bg-slate-100 rounded-full text-slate-600" onClick={() => setActiveConversation(null)}>
                                <ArrowLeftIcon size={20} />
                            </button>
                            <div className="size-10 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center font-bold overflow-hidden shrink-0 shadow-sm">
                                {activeConversation.therapist?.profileImage ? (
                                    <img src={activeConversation.therapist.profileImage} alt={activeConversation.therapist?.user?.name || "Therapist"} className="object-cover w-full h-full" />
                                ) : (
                                    activeConversation.therapist?.user?.name?.charAt(0) || <UserIcon size={20} />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{activeConversation.therapist?.user?.name}</h3>
                                <p className="text-xs text-emerald-600">Connected securely</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-4">
                            {messages.map((msg, idx) => {
                                const isMine = msg.senderId === user?.id;
                                return (
                                    <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm ${isMine ? 'bg-emerald-500 text-white rounded-br-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'}`}>
                                            <p className="text-sm">{msg.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-5 py-3 bg-slate-100 border-transparent focus:bg-white rounded-full focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            />
                            <button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center shadow-md shadow-emerald-500/20"
                            >
                                <SendIcon size={20} className="ml-1" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <UserIcon className="size-16 mb-4 opacity-20" />
                        <p className="text-lg">Select a conversation to start messaging</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
