"use client";

import Link from 'next/link';
import { Users, Settings, Clock, Briefcase, MessageCircle } from 'lucide-react';

interface SideBarTherapistProps {
    sidebarOpen: boolean;
}

const sidebarLinks = [
    { name: 'Availability', href: '/api/therapist/avalabilty', icon: Clock },
    { name: 'Patients', href: '/api/therapist/patients', icon: Users },
    { name: 'Services', href: '/api/therapist/services', icon: Briefcase },
    { name: 'Messages', href: '/api/therapist/messages', icon: MessageCircle },
];

export default function SideBarTherapist({ sidebarOpen }: SideBarTherapistProps) {
    return (
        <aside
            className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 transition-transform duration-300 fixed lg:sticky top-20 lg:top-36 z-40 
      w-72 bg-white text-gray-700 flex flex-col shadow-2xl lg:shadow-sm h-full lg:h-fit lg:pb-4
      left-0 rounded-none lg:rounded-2xl border-r lg:border border-gray-200  `}
        >
            <nav className="overflow-y-auto py-6 scrollbar-hide  ">
                <div className="px-5 mb-4 hidden lg:block">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Main Menu</h2>
                </div>

                <ul className="space-y-1 px-3">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;

                        return (
                            <li key={link.name}>
                                <Link
                                    href={link.href}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                                >
                                    <Icon size={18} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                    {link.name}
                                    {link.name === 'Messages' && (
                                        <span className="ml-auto bg-emerald-100 text-emerald-600 py-0.5 px-2 rounded-full text-[10px] font-bold">2</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="px-5 mt-8 mb-4 hidden lg:block">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Settings</h2>
                </div>
                <ul className="space-y-1 px-3">
                    <li>
                        <Link href="/api/therapist/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium">
                            <Settings size={18} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                            My Profile
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}