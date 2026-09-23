"use client";

import React, { useState } from "react";
import NavBarClient from "@/components/custom/client/NavBarClient";
import SideBarClient from "@/components/custom/client/SideBarClient";

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
  
    return (
        <div className="flex h-screen flex-col bg-slate-50 font-sans">
            {/* Top Navigation */}
            <NavBarClient
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Main Layout */}
            <div className="mx-auto flex h-full w-[95%] max-w-[1600px] flex-1 gap-6 px-4 pt-24 lg:gap-10 lg:px-0">
                {/* Sidebar */}
                <SideBarClient sidebarOpen={sidebarOpen} />

                {/* Content */}
                <main className="min-h-[calc(100vh-6rem)] flex-1 overflow-y-auto bg-transparent py-6">
                    <div className="w-full animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

import { AppProvider } from "@/context/AppProvider";
import { ClientProvider } from "@/context/useClientContext";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppProvider>
            <ClientProvider>
                <ClientLayoutInner>{children}</ClientLayoutInner>
            </ClientProvider>
        </AppProvider>
    );
}