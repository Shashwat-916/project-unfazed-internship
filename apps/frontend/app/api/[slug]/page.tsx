"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, Phone, Mail, User, GraduationCap, Languages, Calendar as CalendarIcon, ArrowLeft, MessageSquare } from "lucide-react";
import Image from "next/image";
import { ClientRoutes } from "@/services/clientRoutes";
import { ConversationRoutes } from "@/services/conversationRoutes";
import { BookAppointmentModal } from "@/components/BookAppoinment";

interface TimeSlot {
    id: number;
    startTime: string;
    endTime: string;
}

interface Availability {
    id: string;
    dayOfWeek: string;
    therapistId: string;
    timeSlotId: number;
    timeSlot: TimeSlot;
}

interface Service {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    serviceImage: string | null;
    createdAt: string;
    updatedAt: string;
    therapistId: string;
}

export interface TherapistDetailedProfile {
    id: string;
    phoneNumber: string;
    slug: string;
    specialization: string[];
    bio: string[];
    profileImage: string | null;
    languages: string[];
    status: string;
    userId: string;
    user: {
        name: string;
        email: string;
    };
    services: Service[];
    avalabilities: Availability[];
}

import { AppProvider } from "@/context/AppProvider";

export default function TherapistInformationPage() {
    return (
        <AppProvider>
            <TherapistInformationContent />
        </AppProvider>
    );
}

function TherapistInformationContent() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    
    const [therapist, setTherapist] = useState<TherapistDetailedProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isMessaging, setIsMessaging] = useState(false);

    useEffect(() => {
        if (!slug) return;
        
        const fetchTherapist = async () => {
            try {
                const clientService = new ClientRoutes(); 
                const res = await clientService.findTherapistBySlug(slug);
                if (res.success) {
                    setTherapist(res.data);
                } else {
                    setError("Failed to load therapist profile.");
                }
            } catch (err: any) {
                console.error(err);
                setError(err?.response?.data?.message || "An error occurred while fetching the profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchTherapist();
    }, [slug]);

    const handleMessageTherapist = async () => {
        if (!therapist) return;
        setIsMessaging(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                // handle unauthenticated
                router.push("/login");
                return;
            }
            const conversationService = new ConversationRoutes(token);
            await conversationService.createConversation({ therapistId: therapist.id }); 
            router.push("/api/client/messages");
        } catch (err) {
            console.error("Failed to initiate message", err);
        } finally {
            setIsMessaging(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin size-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !therapist) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <User className="size-16 text-slate-300" />
                <h2 className="text-2xl font-bold text-slate-700">Therapist Not Found</h2>
                <p className="text-slate-500">{error || "The profile you're looking for does not exist."}</p>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    
    const availabilityByDay = therapist.avalabilities?.reduce((acc: any, avail: any) => {
        if (!acc[avail.dayOfWeek]) acc[avail.dayOfWeek] = [];
        acc[avail.dayOfWeek].push(avail.timeSlot);
        return acc;
    }, {});

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12 animate-in fade-in duration-500">
            {/* Back Navigation */}
            <button 
                onClick={() => router.back()} 
                className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft className="size-4 mr-1" /> Back to Therapists
            </button>

            {/* Hero Section */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[100px] -z-10" />
                
                {/* Profile Image */}
                <div className="shrink-0 relative size-32 md:size-48 rounded-2xl overflow-hidden bg-slate-100 border-4 border-white shadow-md">
                    {therapist.profileImage ? (
                        <Image 
                            src={therapist.profileImage} 
                            alt={therapist.user?.name || "Therapist"} 
                            fill 
                            className="object-cover"
                            unoptimized={therapist.profileImage.includes('localhost') || therapist.profileImage.includes('127.0.0.1')}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                            <User className="size-16" />
                        </div>
                    )}
                </div>

                {/* Main Info */}
                <div className="flex-1 space-y-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{therapist.user?.name}</h1>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {therapist.specialization?.map((spec: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-600 mt-4">
                        <div className="flex items-center gap-2"><Mail className="size-4" /> {therapist.user?.email}</div>
                        <div className="flex items-center gap-2"><Phone className="size-4" /> {therapist.phoneNumber}</div>
                        <div className="flex items-center gap-2"><Languages className="size-4" /> {therapist.languages?.join(", ") || "English"}</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column (Bio & Services) */}
                <div className="md:col-span-2 space-y-8">
                    {/* About Section */}
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <GraduationCap className="size-5 text-primary" /> About Me
                        </h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed">
                            {therapist.bio?.map((paragraph: string, i: number) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>
                    </section>

                    {/* Services Section */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 px-2">Services Offered</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {therapist.services?.map((service: any) => (
                                <div key={service.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-slate-800">{service.name}</h3>
                                        <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                            {service.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{service.description}</p>
                                    <div className="flex items-center text-xs text-slate-400">
                                        <Clock className="size-3 mr-1" /> {service.duration} mins
                                    </div>
                                </div>
                            ))}
                            {(!therapist.services || therapist.services.length === 0) && (
                                <p className="text-slate-500 px-2">No services listed yet.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column (Availability) */}
                <div className="md:col-span-1">
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 sticky top-24">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <CalendarIcon className="size-5 text-primary" /> Availability
                        </h2>
                        
                        {availabilityByDay && Object.keys(availabilityByDay).length > 0 ? (
                            <div className="space-y-6">
                                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                                    if (!availabilityByDay[day]) return null;
                                    
                                    return (
                                        <div key={day}>
                                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                                {day}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {availabilityByDay[day].map((slot: any, i: number) => {
                                                    // Quick parsing of ISO time for clean display if needed, 
                                                    // Assuming time is returned as Date string from DB "1970-01-01T09:00:00.000Z"
                                                    const formatTime = (timeStr: string) => {
                                                        try {
                                                            return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                        } catch(e) { return timeStr; }
                                                    };

                                                    return (
                                                        <div key={i} className="bg-slate-50 border border-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-md">
                                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CalendarIcon className="size-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No availability set.</p>
                            </div>
                        )}
                        
                        <div className="flex gap-3 mt-8">
                            <Button className="w-full flex-1" size="lg" onClick={() => setIsBookingModalOpen(true)}>Book a Session</Button>
                            <Button className="w-full flex-1" variant="outline" size="lg" onClick={handleMessageTherapist} disabled={isMessaging}>
                                <MessageSquare className="size-5 mr-2" />
                                {isMessaging ? "Starting..." : "Message"}
                            </Button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Appointment Booking Modal */}
            <BookAppointmentModal 
                isOpen={isBookingModalOpen} 
                onClose={() => setIsBookingModalOpen(false)} 
                therapist={therapist} 
            />
        </div>
    );
}