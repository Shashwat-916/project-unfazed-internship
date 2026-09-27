"use client";

import React, { useState, useEffect } from "react";
import { ClientIntakeRoutes } from "@/services/clientIntakeRoutes";
import { useAuthContext } from "@/context/useAuthContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/reui/alert";
import { LoaderCircleIcon, CheckIcon, FileTextIcon, ActivityIcon, CrosshairIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientIntakePage() {
    const { token } = useAuthContext();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [hasExistingIntake, setHasExistingIntake] = useState(false);

    const [formData, setFormData] = useState({
        dateOfBirth: "",
        gender: "",
        occupation: "",
        presentingConcern: "",
        currentSymptoms: "",
        medicalHistory: "",
        mentalHealthHistory: "",
        medicationHistory: "",
        familyHistory: "",
        previousTherapy: "",
        goals: "",
    });

    const clientIntakeRoutes = new ClientIntakeRoutes(token || undefined);

    useEffect(() => {
        if (!token) return;

        const fetchIntake = async () => {
            setIsLoading(true);
            try {
                const res = await clientIntakeRoutes.getIntake();
                if (res.success && res.data) {
                    setHasExistingIntake(true);
                    
                    // Format date to YYYY-MM-DD for the date input
                    let dobFormatted = "";
                    if (res.data.dateOfBirth) {
                        dobFormatted = new Date(res.data.dateOfBirth).toISOString().split('T')[0];
                    }

                    setFormData({
                        dateOfBirth: dobFormatted || "",
                        gender: res.data.gender || "",
                        occupation: res.data.occupation || "",
                        presentingConcern: res.data.presentingConcern || "",
                        currentSymptoms: res.data.currentSymptoms || "",
                        medicalHistory: res.data.medicalHistory || "",
                        mentalHealthHistory: res.data.mentalHealthHistory || "",
                        medicationHistory: res.data.medicationHistory || "",
                        familyHistory: res.data.familyHistory || "",
                        previousTherapy: res.data.previousTherapy || "",
                        goals: res.data.goals || "",
                    });
                }
            } catch (error: any) {
                // If the error message indicates not found, it means they don't have an intake yet.
                if (error?.message !== "Client intake not found") {
                    console.error("Error fetching intake:", error);
                    setErrorMsg("Failed to load your intake data.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchIntake();
    }, [token]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveIntake = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setIsSaving(true);

        try {
            // Prepare payload
            const payload: any = { ...formData };
            if (payload.dateOfBirth) {
                payload.dateOfBirth = new Date(payload.dateOfBirth).toISOString();
            } else {
                delete payload.dateOfBirth;
            }

            // Clean up empty strings to avoid validation errors if they are optional
            Object.keys(payload).forEach(key => {
                if (payload[key] === "") delete payload[key];
            });

            if (hasExistingIntake) {
                const res = await clientIntakeRoutes.updateIntake(payload);
                if (res.success) setSuccessMsg("Intake form updated successfully!");
            } else {
                const res = await clientIntakeRoutes.createIntake(payload);
                if (res.success) {
                    setSuccessMsg("Intake form created successfully!");
                    setHasExistingIntake(true);
                }
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error: any) {
            console.error("Error saving intake:", error);
            setErrorMsg(error?.response?.data?.message || "Failed to save intake form.");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <LoaderCircleIcon className="size-12 animate-spin text-emerald-500" />
                <p className="text-slate-400 font-medium animate-pulse text-lg">Loading your intake form...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl mx-auto mt-8 sm:mt-12 space-y-8 pb-20 px-4 sm:px-6"
        >
            <AnimatePresence>
                {errorMsg && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errorMsg}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
                {successMsg && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert variant="success" className="mb-4">
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{successMsg}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-emerald-900/10 border border-white overflow-hidden">
                {/* Banner Section */}
                <div className="relative h-48 bg-gradient-to-r from-emerald-500 to-teal-400 flex flex-col justify-end p-8">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                    <div className="relative z-10 flex items-center gap-4 text-white">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                            <FileTextIcon className="size-10" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold font-serif">Intake Form</h1>
                            <p className="text-emerald-50 text-sm mt-1">Please provide details to help your therapist understand your needs.</p>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSaveIntake} className="p-6 sm:p-12 space-y-12 bg-slate-50/50">
                    
                    {/* SECTION: Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-800 border-b border-slate-200 pb-2">
                            <CheckIcon className="text-emerald-500 size-5" />
                            <h3 className="text-xl font-bold">Basic Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Non-binary">Non-binary</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Occupation</label>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Software Engineer"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Presenting Concerns */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-800 border-b border-slate-200 pb-2">
                            <ActivityIcon className="text-emerald-500 size-5" />
                            <h3 className="text-xl font-bold">Presenting Concerns & Symptoms</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Main Reason for Seeking Therapy</label>
                                <textarea
                                    name="presentingConcern"
                                    value={formData.presentingConcern}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                                    placeholder="What brings you to therapy today?"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Current Symptoms</label>
                                <textarea
                                    name="currentSymptoms"
                                    value={formData.currentSymptoms}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                                    placeholder="Any anxiety, depression, sleep issues, etc.?"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: History */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-800 border-b border-slate-200 pb-2">
                            <FileTextIcon className="text-emerald-500 size-5" />
                            <h3 className="text-xl font-bold">Health History</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Mental Health History</label>
                                <textarea
                                    name="mentalHealthHistory"
                                    value={formData.mentalHealthHistory}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Previous Therapy Experience</label>
                                <textarea
                                    name="previousTherapy"
                                    value={formData.previousTherapy}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Medical History</label>
                                <textarea
                                    name="medicalHistory"
                                    value={formData.medicalHistory}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Current Medications</label>
                                <textarea
                                    name="medicationHistory"
                                    value={formData.medicationHistory}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Family Health History</label>
                                <textarea
                                    name="familyHistory"
                                    value={formData.familyHistory}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Goals */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-800 border-b border-slate-200 pb-2">
                            <CrosshairIcon className="text-emerald-500 size-5" />
                            <h3 className="text-xl font-bold">Goals & Expectations</h3>
                        </div>
                        <div className="space-y-2">
                            <textarea
                                name="goals"
                                value={formData.goals}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                                placeholder="What would you like to achieve through therapy?"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`
                                px-8 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all
                                ${isSaving 
                                    ? "bg-emerald-400 cursor-wait shadow-emerald-400/50" 
                                    : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/50 hover:-translate-y-0.5"
                                }
                            `}
                        >
                            {isSaving ? (
                                <div className="flex items-center gap-2">
                                    <LoaderCircleIcon className="size-4 animate-spin" />
                                    Saving...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <CheckIcon className="size-5" />
                                    {hasExistingIntake ? "Save Changes" : "Submit Intake"}
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
