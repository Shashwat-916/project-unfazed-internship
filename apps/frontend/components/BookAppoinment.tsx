"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, Calendar as CalendarIcon, Clock, CreditCard, 
    CheckCircle2, ArrowRight, ArrowLeft, Loader2, IndianRupee, ShieldCheck
} from "lucide-react";
import { 
    Stepper, StepperItem, StepperTrigger, StepperIndicator, 
    StepperTitle, StepperSeparator, StepperContent, 
    StepperPanel, StepperNav 
} from "@/components/reui/stepper";
import { Button } from "@/components/ui/button";
import { AppointmentRoutes } from "@/services/appointmentRoutes";
import { PaymentRoutes } from "@/services/paymentRoutes";
import { useAuthContext } from "@/context/useAuthContext";

// Types
export interface TimeSlot {
    id: number;
    startTime: string;
    endTime: string;
}

export interface Availability {
    id: string;
    dayOfWeek: string;
    therapistId: string;
    timeSlotId: number;
    timeSlot: TimeSlot;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    serviceImage: string | null;
}

export interface TherapistProps {
    id: string;
    user: { name: string; email: string };
    services: Service[];
    avalabilities: Availability[];
}

interface BookAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    therapist: TherapistProps;
}

export const BookAppointmentModal = ({ isOpen, onClose, therapist }: BookAppointmentModalProps) => {
    const { token } = useAuthContext();
    const [activeStep, setActiveStep] = useState(1);
    
    // Selections
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<Availability | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    
    // Status
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Filter available days based on therapist availabilities
    const availableDays = useMemo(() => {
        const days = new Set<string>();
        therapist.avalabilities?.forEach(a => days.add(a.dayOfWeek));
        return Array.from(days);
    }, [therapist.avalabilities]);

    // Available time slots for selected day
    const availableTimeSlots = useMemo(() => {
        if (!selectedDay) return [];
        return therapist.avalabilities?.filter(a => a.dayOfWeek === selectedDay) || [];
    }, [selectedDay, therapist.avalabilities]);

    // Format time helpers
    const formatTime = (timeStr: string) => {
        try {
            return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch(e) { return timeStr; }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Reset state on open/close
    useEffect(() => {
        if (isOpen) {
            setActiveStep(1);
            setSelectedService(null);
            setSelectedDay(null);
            setSelectedTimeSlot(null);
            setSelectedDate(null);
            setIsSuccess(false);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNext = () => setActiveStep(prev => Math.min(prev + 1, 3));
    const handlePrev = () => setActiveStep(prev => Math.max(prev - 1, 1));

    const handleBooking = async () => {
        if (!selectedService || !selectedDay || !selectedTimeSlot || !selectedDate || !token) {
            setError("Please complete all steps and ensure you are logged in.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                throw new Error("Razorpay SDK failed to load. Are you online?");
            }

            const appointmentService = new AppointmentRoutes(token);
            const paymentService = new PaymentRoutes(token);

            // 1. Format date as YYYY-MM-DD
            const formattedDate = selectedDate.toISOString().split('T')[0];

            const bookingData = {
                therapistId: therapist.id,
                serviceId: selectedService.id,
                date: formattedDate,
                day: selectedDay,
                timeSlotId: selectedTimeSlot.timeSlotId
            };

            // 2. Book appointment and get Order ID
            const bookingRes = await appointmentService.bookAppointment(bookingData);
            
            if (!bookingRes.success || !bookingRes.appointment?.payment?.gatewayOrderId) {
                throw new Error("Failed to initialize booking.");
            }

            const { gatewayOrderId, amount } = bookingRes.appointment.payment;

            // 3. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TX9BlfbgHtpGjd",
                amount: amount,
                currency: "INR",
                name: "Unfazed Therapy",
                description: `Appointment with ${therapist.user.name}`,
                order_id: gatewayOrderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        if (verifyRes.success) {
                            setIsSuccess(true);
                        } else {
                            setError("Payment verification failed.");
                        }
                    } catch (err: any) {
                        setError("Payment verification error.");
                    }
                },
                prefill: {
                    name: "Client",
                    email: "client@example.com",
                },
                theme: {
                    color: "#3b82f6" // Primary color
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                setError(response.error.description || "Payment failed");
            });
            rzp.open();

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "An error occurred during booking.");
        } finally {
            setIsLoading(false);
        }
    };

    // Calendar Generation
    const renderCalendar = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        const dayNamesMap: { [key: number]: string } = {
            0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY'
        };

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dateDayName = dayNamesMap[date.getDay()];
            
            const isPast = date < new Date(today.setHours(0,0,0,0));
            const isMatchDay = dateDayName === selectedDay;
            const isDisabled = isPast || !isMatchDay;
            const isSelected = selectedDate?.getDate() === d;

            days.push(
                <button
                    key={d}
                    disabled={isDisabled}
                    onClick={() => setSelectedDate(date)}
                    className={`
                        h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                        ${isDisabled ? 'text-slate-300 cursor-not-allowed bg-slate-50' : 'hover:bg-primary/20 text-slate-700 cursor-pointer bg-white border border-slate-200'}
                        ${isSelected ? '!bg-primary text-white shadow-md' : ''}
                    `}
                >
                    {d}
                </button>
            );
        }

        return (
            <div className="w-full max-w-sm mx-auto bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-center mb-4 font-semibold text-slate-800">
                    {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Book Appointment</h2>
                        <p className="text-sm text-slate-500">with {therapist.user?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="size-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-500">
                            <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="size-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                Your appointment with {therapist.user?.name} has been successfully scheduled. We've sent the details to your email.
                            </p>
                            <Button onClick={onClose} size="lg" className="rounded-full px-8">Done</Button>
                        </div>
                    ) : (
                        <Stepper value={activeStep} orientation="horizontal" className="h-full flex flex-col">
                            {/* Navigation */}
                            <StepperNav className="mb-8">
                                {[1, 2, 3].map((step) => (
                                    <StepperItem key={step} step={step}>
                                        <StepperTrigger className="cursor-default hover:bg-transparent">
                                            <StepperIndicator>
                                                {step === 1 && <Clock className="size-3" />}
                                                {step === 2 && <CalendarIcon className="size-3" />}
                                                {step === 3 && <CreditCard className="size-3" />}
                                            </StepperIndicator>
                                            <div className="flex flex-col items-start ml-2 hidden sm:flex">
                                                <StepperTitle>{step === 1 ? 'Service' : step === 2 ? 'Time & Day' : 'Date & Pay'}</StepperTitle>
                                            </div>
                                        </StepperTrigger>
                                        {step !== 3 && <StepperSeparator />}
                                    </StepperItem>
                                ))}
                            </StepperNav>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2 animate-in fade-in">
                                    <ShieldCheck className="size-5 shrink-0" /> {error}
                                </div>
                            )}

                            {/* Panels */}
                            <div className="flex-1 min-h-[300px]">
                                {/* Step 1: Services */}
                                <StepperContent value={1} className="space-y-4 animate-in slide-in-from-right-4">
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-slate-800">Select a Service</h3>
                                        <p className="text-sm text-slate-500">Choose the type of session you'd like to book.</p>
                                    </div>
                                    <div className="grid gap-3">
                                        {therapist.services?.map(service => (
                                            <div 
                                                key={service.id}
                                                onClick={() => setSelectedService(service)}
                                                className={`
                                                    p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center
                                                    ${selectedService?.id === service.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-100 hover:border-primary/30'}
                                                `}
                                            >
                                                <div>
                                                    <h4 className="font-semibold text-slate-800">{service.name}</h4>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                        <span className="flex items-center gap-1"><Clock className="size-3"/> {service.duration} mins</span>
                                                    </div>
                                                </div>
                                                <div className="text-lg font-bold text-slate-800 flex items-center">
                                                    <IndianRupee className="size-4 mr-0.5" />
                                                    {service.price}
                                                </div>
                                            </div>
                                        ))}
                                        {(!therapist.services || therapist.services.length === 0) && (
                                            <p className="text-slate-500 text-center py-8">No services available.</p>
                                        )}
                                    </div>
                                </StepperContent>

                                {/* Step 2: Day and Time */}
                                <StepperContent value={2} className="space-y-6 animate-in slide-in-from-right-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">Select Day of Week</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {availableDays.length > 0 ? availableDays.map(day => (
                                                <button
                                                    key={day}
                                                    onClick={() => { setSelectedDay(day); setSelectedTimeSlot(null); }}
                                                    className={`
                                                        px-4 py-2 rounded-xl text-sm font-medium transition-all border
                                                        ${selectedDay === day ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-primary/50'}
                                                    `}
                                                >
                                                    {day}
                                                </button>
                                            )) : (
                                                <p className="text-sm text-slate-500">No availability set by therapist.</p>
                                            )}
                                        </div>
                                    </div>

                                    {selectedDay && (
                                        <div className="animate-in fade-in slide-in-from-bottom-2">
                                            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                                                <Clock className="size-5 text-primary" /> Available Time Slots
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {availableTimeSlots.map(slot => (
                                                    <button
                                                        key={slot.id}
                                                        onClick={() => setSelectedTimeSlot(slot)}
                                                        className={`
                                                            px-3 py-3 rounded-xl text-sm font-medium transition-all border text-center
                                                            ${selectedTimeSlot?.id === slot.id ? 'bg-primary/10 text-primary border-primary shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-primary/50'}
                                                        `}
                                                    >
                                                        {formatTime(slot.timeSlot.startTime)} - {formatTime(slot.timeSlot.endTime)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </StepperContent>

                                {/* Step 3: Date */}
                                <StepperContent value={3} className="space-y-6 animate-in slide-in-from-right-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">Select Date</h3>
                                        <p className="text-sm text-slate-500 mb-6">Choose an upcoming {selectedDay?.toLowerCase()} for your session.</p>
                                        
                                        {renderCalendar()}
                                        
                                        {selectedDate && (
                                            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center animate-in zoom-in-95">
                                                <div>
                                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Summary</div>
                                                    <div className="text-sm font-medium text-slate-800">
                                                        {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {selectedTimeSlot ? `${formatTime(selectedTimeSlot.timeSlot.startTime)} - ${formatTime(selectedTimeSlot.timeSlot.endTime)}` : ''}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Amount</div>
                                                    <div className="text-xl font-bold text-slate-800 flex items-center justify-end">
                                                        <IndianRupee className="size-5 mr-0.5" />
                                                        {selectedService?.price}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </StepperContent>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center">
                                <Button 
                                    variant="outline" 
                                    onClick={handlePrev} 
                                    disabled={activeStep === 1 || isLoading}
                                    className="rounded-full"
                                >
                                    <ArrowLeft className="size-4 mr-2" /> Back
                                </Button>
                                
                                {activeStep < 3 ? (
                                    <Button 
                                        onClick={handleNext} 
                                        disabled={(activeStep === 1 && !selectedService) || (activeStep === 2 && !selectedTimeSlot)}
                                        className="rounded-full px-6 shadow-md shadow-primary/20"
                                    >
                                        Next <ArrowRight className="size-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={handleBooking} 
                                        disabled={!selectedDate || isLoading}
                                        className="rounded-full px-8 shadow-md shadow-primary/20"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="size-4 mr-2 animate-spin" /> Processing...</>
                                        ) : (
                                            <><CreditCard className="size-4 mr-2" /> Proceed to Payment</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </Stepper>
                    )}
                </div>
            </div>
        </div>
    );
};