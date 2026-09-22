"use client";

import React, { useState } from "react";
import NavBarClient from "@/components/custom/client/NavBarClient";
import SideBarClient from "@/components/custom/client/SideBarClient";

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
  
    const userName = "shashwat client";
    const userInitials = "CU";
    const profileImage = null;

    return (
        <div className="flex h-screen flex-col bg-slate-50 font-sans">
            {/* Top Navigation */}
            <NavBarClient
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                userRole="Client"
                userName={userName}
                userInitials={userInitials}
                profileImage={profileImage}
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

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Removed <ClientProvider> since it wasn't found in the codebase yet. Add back when created.
    return (
        <ClientLayoutInner>{children}</ClientLayoutInner>
    );
}