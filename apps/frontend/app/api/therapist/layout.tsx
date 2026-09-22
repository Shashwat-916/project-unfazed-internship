"use client";

import React, { useState } from "react";
import NavBarTherapist from "@/components/custom/therapist/NavBarTherapist";
import SideBarTherapist from "@/components/custom/therapist/SideBarTherapist";


function TherapistLayoutInner({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const userName = "shashwat therapist";
    const userInitials = "TU";
    const profileImage = null;

    return (
        <div className="flex h-screen flex-col bg-slate-50 font-sans">
            {/* Top Navigation */}
            <NavBarTherapist
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                userRole="Therapist"
                userName={userName}
                userInitials={userInitials}
                profileImage={profileImage}
            />

            {/* Main Layout */}
            <div className="mx-auto flex h-full w-[95%] max-w-[1600px] flex-1 gap-6 px-4 pt-24 lg:gap-10 lg:px-0">
                {/* Sidebar */}
                <SideBarTherapist sidebarOpen={sidebarOpen} />

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

export default function TherapistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (

        <TherapistLayoutInner>{children}</TherapistLayoutInner>

    );
}