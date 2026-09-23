"use client";

import React, { useState } from 'react';
import { Menu, X, Bell } from 'lucide-react';

import Link from 'next/link';


interface NavBarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from '../landing/Logo';
import ClientNotificationDropdown from './ClientNotificationDropDown';
import { useClientContext } from '@/context/useClientContext';
import { useAuthContext } from '@/context/useAuthContext';
import { useRouter } from 'next/navigation';

export default function NavBarClient({ sidebarOpen, setSidebarOpen }: NavBarProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { profile } = useClientContext();
    const { logout } = useAuthContext();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };
    
    const userName = profile?.user?.name || "Client";
    const userRole = "Client";
    const userInitials = userName.substring(0, 2).toUpperCase();
    const profileImage = profile?.profileImage;

    return (
        <header className=" bg-white border-b fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-24 " >

            <div className="w-[70%] max-w-[1600px] flex justify-between items-center ">

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div className="flex items-center pl-30">
                        <Logo />
                    </div>
                </div>

                {/* Right side - Profile & other stuff */}
                <div className="flex items-center gap-4 sm:gap-6 pr-0">
                    <ClientNotificationDropdown />


                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                    <div className="relative">
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2.5 rounded-xl transition-all select-none"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-semibold text-gray-900 leading-none mb-1">{userName}</p>
                                <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">{userRole}</p>
                            </div>
                            <Avatar className="w-9 h-9 border border-gray-200">
                                <AvatarImage src={profileImage || undefined} alt={userName} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-sm">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {dropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                                    <div className="py-1">
                                        <Link
                                            href='/api/client/profile'
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                                        >
                                            Profile Settings
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                handleLogout();
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </header>
    );
}