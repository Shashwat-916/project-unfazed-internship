"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';


export default function TherapistNotificationDropdown() {
    const [liveNotifications, setLiveNotifications] = useState<any[]>([]);

    const markNotificationRead = (id: string) => {
        setLiveNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        markNotificationRead(id);
    };

    const handleMarkAllAsRead = () => {
        liveNotifications.forEach(n => {
            if (!n.read) {
                markNotificationRead(n.id);
            }
        });
    };

    const unreadCount = liveNotifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-[50vw] md:w-[25vw] lg:w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-sm sm:text-base font-semibold text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {liveNotifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No notifications yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {liveNotifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-3 sm:p-4 flex gap-2 sm:gap-3 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-emerald-50/30' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[13px] sm:text-sm leading-snug ${!notification.read ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                                                {notification.content}
                                            </p>
                                            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <button 
                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                className="shrink-0 p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors self-center"
                                                title="Mark as read"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}