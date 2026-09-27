"use client";

import { useEffect, useState } from "react";
import { AppointmentRoutes } from "@/services/appointmentRoutes";
import { AppProvider } from "@/context/AppProvider";
import { Calendar, Clock, Video, FileText, Loader2, CheckCircle2, Clock3, UserCircle, AlertCircle, Edit3 } from "lucide-react";
import { IntakeModal, IntakeData } from "@/components/IntakeModal";
import { SessionNotesModal } from "@/components/SessionNotesModal";
import { VideoCall } from "@/components/VideoCall";

interface Appointment {
    id: string;
    clientId: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
    paymentStatus: string;
    appointmentStatus: string;
    client?: {
        profileImage?: string;
        user?: {
            name: string;
        };
        intake?: {
            presentingConcern?: string;
            currentSymptoms?: string;
            medicalHistory?: string;
            mentalHealthHistory?: string;
            medicationHistory?: string;
            familyHistory?: string;
            previousTherapy?: string;
            goals?: string;
        } | null;
    };
    service?: {
        name: string;
        duration: number;
    };
}

function TherapistAppointmentsContent() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedIntake, setSelectedIntake] = useState<{ intake: IntakeData, clientName: string } | null>(null);
    const [selectedNoteAppointment, setSelectedNoteAppointment] = useState<{ id: string, clientId: string } | null>(null);
    const [videoCallData, setVideoCallData] = useState<{ id: string, peerName: string, peerImage?: string } | null>(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                if (!token) {
                    setError("You must be logged in to view appointments.");
                    setIsLoading(false);
                    return;
                }
                const service = new AppointmentRoutes(token);
                const res = await service.getTherapistAppointments();
                if (res.success) {
                    setAppointments(res.appointments || []);
                } else {
                    setError(res.message || "Failed to fetch appointments.");
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching appointments.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patient Appointments</h1>
                        <p className="text-slate-500 mt-2">Manage your schedule and upcoming therapy sessions.</p>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p className="text-slate-500">Loading schedule...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center font-medium">
                        {error}
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
                        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="size-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Appointments Yet</h3>
                        <p className="text-slate-500 max-w-sm">You don't have any booked sessions currently. Ensure your availability is set up correctly.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {appointments.map((appointment) => {
                            const { date, time } = formatDateTime(appointment.startTime);
                            const clientName = appointment.client?.user?.name || "Anonymous Patient";
                            const serviceName = appointment.service?.name || "Therapy Session";
                            const duration = appointment.service?.duration || 50;

                            return (
                                <div key={appointment.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        
                                        {/* Left: Info */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    {appointment.client?.profileImage ? (
                                                        <img 
                                                            src={appointment.client.profileImage} 
                                                            alt={clientName} 
                                                            className="size-12 rounded-full object-cover shadow-sm border border-slate-200"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                            <UserCircle className="size-8" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900">{clientName}</h3>
                                                        <p className="text-primary font-medium text-sm">{serviceName}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${getStatusStyle(appointment.appointmentStatus)}`}>
                                                    {appointment.appointmentStatus}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                    <Calendar className="size-4 text-slate-400" />
                                                    {date}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                    <Clock3 className="size-4 text-slate-400" />
                                                    {time} ({duration} mins)
                                                </div>
                                                <button 
                                                    onClick={() => setVideoCallData({
                                                        id: appointment.id,
                                                        peerName: clientName,
                                                        peerImage: appointment.client?.profileImage
                                                    })}
                                                    className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer"
                                                >
                                                    <Video className="size-4 text-indigo-500" />
                                                    Join Online Video
                                                </button>
                                            </div>

                                            {/* Client Intake & Notes Buttons */}
                                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                                {appointment.client?.intake ? (
                                                    <button 
                                                        onClick={() => setSelectedIntake({ 
                                                            intake: appointment.client!.intake as IntakeData, 
                                                            clientName 
                                                        })}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
                                                    >
                                                        <FileText className="size-4" /> View Intake Form
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 text-sm font-medium rounded-xl border border-slate-200">
                                                        <AlertCircle className="size-4" /> Intake Form Not Submitted
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => setSelectedNoteAppointment({ 
                                                        id: appointment.id, 
                                                        clientId: appointment.clientId 
                                                    })}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100"
                                                >
                                                    <Edit3 className="size-4" /> Add/Edit Session Note
                                                </button>
                                            </div>
                                        </div>

                                        {/* Right: Actions / Pricing */}
                                        <div className="md:border-l border-slate-100 md:pl-6 flex flex-col justify-between items-start md:items-end min-w-[200px] gap-4 md:gap-0">
                                            <div className="text-left md:text-right w-full">
                                                <p className="text-sm text-slate-500 mb-1">Session Revenue</p>
                                                <p className="text-2xl font-bold text-slate-900">₹{appointment.totalAmount}</p>
                                                <div className="flex items-center gap-1 mt-1 justify-start md:justify-end">
                                                    {appointment.paymentStatus === 'SUCCESS' ? (
                                                        <><CheckCircle2 className="size-4 text-green-500" /><span className="text-xs font-semibold text-green-600">PAID</span></>
                                                    ) : (
                                                        <><Clock className="size-4 text-yellow-500" /><span className="text-xs font-semibold text-yellow-600">PAYMENT PENDING</span></>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="w-full flex gap-2">
                                                {/* Actions can go here in the future */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {/* Intake Modal */}
                <IntakeModal 
                    isOpen={selectedIntake !== null} 
                    onClose={() => setSelectedIntake(null)} 
                    intake={selectedIntake?.intake || null}
                    clientName={selectedIntake?.clientName || ""}
                />

                {/* Session Notes Modal */}
                {selectedNoteAppointment && (
                    <SessionNotesModal
                        isOpen={true}
                        onClose={() => setSelectedNoteAppointment(null)}
                        appointmentId={selectedNoteAppointment.id}
                        clientId={selectedNoteAppointment.clientId}
                    />
                )}

                {/* Video Call Modal */}
                {videoCallData && (
                    <VideoCall
                        isOpen={true}
                        onClose={() => setVideoCallData(null)}
                        appointmentId={videoCallData.id}
                        userId="therapist" // the server doesn't care exactly, but we could use therapistId
                        role="THERAPIST"
                        peerName={videoCallData.peerName}
                        peerImage={videoCallData.peerImage}
                    />
                )}
            </div>
        </div>
    );
}

export default function TherapistAppointmentsPage() {
    return (
        <AppProvider>
            <TherapistAppointmentsContent />
        </AppProvider>
    );
}
