"use client";

import React, { useState, useEffect } from "react";
import { AvailabilityRoutes, TimeSlot, Availability } from "@/services/availabilityRoutes";
import { useAuthContext } from "@/context/useAuthContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/reui/alert";
import { LoaderCircleIcon, ClockIcon, ChevronDownIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS_OF_WEEK = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY"
];

function formatTime(timeStr: string) {
    try {
        const date = new Date(timeStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return timeStr;
    }
}

export default function AvailabilityPage() {
    const { token } = useAuthContext();
    const [openDay, setOpenDay] = useState<string>("MONDAY");
    
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isToggling, setIsToggling] = useState<number | null>(null);
    
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const availabilityRoutes = new AvailabilityRoutes(token || undefined);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setIsLoading(true);
            setErrorMsg("");
            try {
                const [slotsRes, availRes] = await Promise.all([
                    availabilityRoutes.getTimeSlots(),
                    availabilityRoutes.getAvailability()
                ]);

                if (slotsRes.success && availRes.success) {
                    setTimeSlots(slotsRes.data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
                    setAvailabilities(availRes.data);
                } else {
                    setErrorMsg("Failed to load availability data.");
                }
            } catch (error: any) {
                console.error("Error fetching data:", error);
                setErrorMsg(error?.response?.data?.message || "An error occurred while loading data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleToggleSlot = async (slot: TimeSlot, dayOfWeek: string) => {
        setErrorMsg("");
        setSuccessMsg("");
        setIsToggling(slot.id);
        
        const existing = availabilities.find(a => a.dayOfWeek === dayOfWeek && a.timeSlotId === slot.id);
        
        try {
            if (existing) {
                const res = await availabilityRoutes.deleteAvailability(existing.id);
                if (res.success) {
                    setAvailabilities(prev => prev.filter(a => a.id !== existing.id));
                }
            } else {
                const res = await availabilityRoutes.createAvailability({ dayOfWeek: dayOfWeek, timeSlotId: slot.id });
                if (res.success) {
                    setAvailabilities(prev => [...prev, res.data]);
                }
            }
        } catch (error: any) {
            console.error("Error toggling slot:", error);
            setErrorMsg(error?.response?.data?.message || "Failed to update availability.");
        } finally {
            setIsToggling(null);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl mx-auto mt-8 sm:mt-12 space-y-8 pb-20 px-4 sm:px-6"
        >

            <AnimatePresence>
                {errorMsg && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert variant="destructive" className="mb-2">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errorMsg}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
                {successMsg && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert variant="success" className="mb-2">
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{successMsg}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <LoaderCircleIcon className="size-12 animate-spin text-emerald-500" />
                    <p className="text-slate-400 font-medium animate-pulse text-lg">Syncing your schedule...</p>
                </div>
            ) : (
                <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-emerald-900/10 overflow-hidden border border-white flex flex-col divide-y divide-slate-100">
                    
                    {DAYS_OF_WEEK.map((day) => {
                        const isOpen = openDay === day;
                        
                        return (
                            <div key={day} className="flex flex-col bg-white">
                                {/* Toggle Header */}
                                <button
                                    onClick={() => setOpenDay(isOpen ? "" : day)}
                                    className="flex items-center justify-between p-5 sm:p-8 hover:bg-slate-50/50 transition-colors duration-200 outline-none"
                                >
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-3">
                                        <ClockIcon className={`size-6 sm:size-7 transition-colors ${isOpen ? 'text-emerald-500' : 'text-slate-400'}`} />
                                        {day.charAt(0) + day.slice(1).toLowerCase()}
                                    </h3>
                                    
                                    <motion.div
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDownIcon className="size-6 text-slate-400" />
                                    </motion.div>
                                </button>
                                
                                {/* Toggle Content */}
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            className="overflow-hidden bg-slate-50/50"
                                        >
                                            <div className="p-5 sm:p-8 border-t border-slate-100">
                                                
                                                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <p className="text-sm sm:text-base text-slate-500">
                                                        Tap to open or close specific times for appointments.
                                                    </p>
                                                    <div className="flex items-center gap-4 sm:gap-6 bg-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30"></div>
                                                            <span className="text-xs sm:text-sm font-medium text-slate-700">Available</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white border-2 border-slate-200"></div>
                                                            <span className="text-xs sm:text-sm font-medium text-slate-700">Closed</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {timeSlots.length === 0 ? (
                                                    <div className="text-center py-12 sm:py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                                                        <ClockIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mb-4" />
                                                        <p className="text-slate-500 font-medium text-sm sm:text-base">No time slots are configured in the system.</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-3 sm:gap-5">
                                                        {timeSlots.map((slot) => {
                                                            const isAvailable = availabilities.some(a => a.dayOfWeek === day && a.timeSlotId === slot.id);
                                                            const loading = isToggling === slot.id;

                                                            return (
                                                                <motion.button
                                                                    key={slot.id}
                                                                    layout
                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                                                                    whileTap={!loading ? { scale: 0.98 } : {}}
                                                                    onClick={() => handleToggleSlot(slot, day)}
                                                                    disabled={loading}
                                                                    className={`
                                                                        relative flex items-center justify-center p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 text-sm sm:text-base font-bold transition-colors duration-300
                                                                        ${isAvailable 
                                                                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-md sm:shadow-lg shadow-emerald-600/20' 
                                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-sm'
                                                                        }
                                                                        ${loading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}
                                                                    `}
                                                                >
                                                                    {loading ? (
                                                                        <LoaderCircleIcon className="size-5 sm:size-6 animate-spin absolute" />
                                                                    ) : (
                                                                        <span className="tracking-wide">
                                                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                                        </span>
                                                                    )}
                                                                </motion.button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}