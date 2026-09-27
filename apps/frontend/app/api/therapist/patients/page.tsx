"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppointmentRoutes } from "@/services/appointmentRoutes";
import { AppProvider } from "@/context/AppProvider";
import { Calendar, Loader2, UserCircle, Activity, Clock, Phone, Mail, MessageSquare } from "lucide-react";
import { ConversationRoutes } from "@/services/conversationRoutes";


interface Appointment {
    id: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
    paymentStatus: string;
    appointmentStatus: string;
    clientId: string;
    client?: {
        id: string;
        user?: {
            name: string;
            email?: string;
        };
    };
    service?: {
        name: string;
    };
}

interface PatientMetric {
    clientId: string;
    name: string;
    email: string;
    totalSessions: number;
    completedSessions: number;
    lastSessionDate: Date | null;
    nextSessionDate: Date | null;
}

function TherapistPatientsContent() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                if (!token) {
                    setError("You must be logged in to view patients.");
                    setIsLoading(false);
                    return;
                }
                const service = new AppointmentRoutes(token);
                const res = await service.getTherapistAppointments();
                if (res.success) {
                    setAppointments(res.appointments || []);
                } else {
                    setError(res.message || "Failed to fetch data.");
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching patients.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const patients = useMemo(() => {
        const patientMap = new Map<string, PatientMetric>();
        const now = new Date();

        appointments.forEach(app => {
            if (!app.client) return;
            const clientId = app.clientId;
            
            if (!patientMap.has(clientId)) {
                patientMap.set(clientId, {
                    clientId,
                    name: app.client.user?.name || "Anonymous Patient",
                    email: app.client.user?.email || "No email provided",
                    totalSessions: 0,
                    completedSessions: 0,
                    lastSessionDate: null,
                    nextSessionDate: null,
                });
            }

            const metric = patientMap.get(clientId)!;
            const appDate = new Date(app.startTime);

            metric.totalSessions += 1;
            if (app.appointmentStatus === 'COMPLETED') {
                metric.completedSessions += 1;
            }

            if (appDate < now) {
                if (!metric.lastSessionDate || appDate > metric.lastSessionDate) {
                    metric.lastSessionDate = appDate;
                }
            } else if (app.appointmentStatus !== 'CANCELLED') {
                if (!metric.nextSessionDate || appDate < metric.nextSessionDate) {
                    metric.nextSessionDate = appDate;
                }
            }
        });

        return Array.from(patientMap.values()).sort((a, b) => {
            // Sort by most recently active (or next upcoming)
            const dateA = a.nextSessionDate || a.lastSessionDate || new Date(0);
            const dateB = b.nextSessionDate || b.lastSessionDate || new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
    }, [appointments]);

    const handleMessagePatient = async (clientId: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const conversationService = new ConversationRoutes(token);
            // Assuming createConversation uses the authenticated user as one party and passed ID as the other
            await conversationService.createConversation({ clientId });
            router.push("/api/therapist/messages");
        } catch (error) {
            console.error("Failed to message patient", error);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "Never";
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Patients</h1>
                        <p className="text-slate-500 mt-2">A consolidated view of all your patients and their session history.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <UserCircle className="size-5 text-primary" />
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Total Patients</p>
                            <p className="text-lg font-bold text-slate-900 leading-none">{patients.length}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p className="text-slate-500">Processing patient records...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center font-medium">
                        {error}
                    </div>
                ) : patients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
                        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <UserCircle className="size-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Patients Yet</h3>
                        <p className="text-slate-500 max-w-sm">You haven't seen any patients yet. Once appointments are booked, they will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {patients.map((patient) => (
                            <div key={patient.clientId} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                
                                {/* Top: Identity */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                        <UserCircle className="size-8" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="text-lg font-bold text-slate-900 truncate">{patient.name}</h3>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-500 truncate mt-0.5">
                                            <Mail className="size-3.5" /> {patient.email}
                                        </div>
                                    </div>
                                </div>

                                {/* Middle: Metrics */}
                                <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                                            <Activity className="size-3.5" /> Total Sessions
                                        </div>
                                        <p className="text-xl font-bold text-slate-900">
                                            {patient.totalSessions} <span className="text-sm font-normal text-slate-400">({patient.completedSessions} done)</span>
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
                                            <Clock className="size-3.5" /> Last Seen
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 mt-1.5">
                                            {formatDate(patient.lastSessionDate)}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom: Action / Next Session */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                    <div className="text-sm">
                                        {patient.nextSessionDate ? (
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-primary">Next Session</span>
                                                <span className="font-semibold text-slate-700">{formatDate(patient.nextSessionDate)}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 font-medium">No upcoming sessions</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleMessagePatient(patient.clientId)}
                                            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                                        >
                                            <MessageSquare className="size-5" />
                                        </button>
                                        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors">
                                            View File
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TherapistPatientsPage() {
    return (
        <AppProvider>
            <TherapistPatientsContent />
        </AppProvider>
    );
}
