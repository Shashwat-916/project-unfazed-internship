"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Stethoscope } from "lucide-react"

export interface RegistrationTherapistFormUIProps {
    formData: any
    setFormData: (data: any) => void
    isLoading: boolean
    onSubmit: (e: React.FormEvent) => void
}

export default function RegistrationTherapistFormStep({ formData, setFormData, isLoading, onSubmit }: RegistrationTherapistFormUIProps) {
    return (
        <div className="w-full max-w-lg mx-auto mt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <Stethoscope className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Therapist Profile</h2>
                <p className="text-slate-500 max-w-sm mx-auto">
                    Let's set up your professional profile to connect with clients.
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <Input
                            placeholder="Dr. John Therapist"
                            value={formData?.name || ""}
                            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                            disabled={isLoading}
                            className="h-12 px-4 focus-visible:ring-emerald-500 text-base"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Phone Number</label>
                        <Input
                            placeholder="9336288768"
                            type="tel"
                            value={formData?.phoneNumber || ""}
                            onChange={(e: any) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setFormData({ ...formData, phoneNumber: val });
                            }}
                            disabled={isLoading}
                            className="h-12 px-4 focus-visible:ring-emerald-500 text-base"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Bio</label>
                    <Input
                        placeholder="Expert in CBT with 10 years experience"
                        value={formData?.bio || ""}
                        onChange={(e: any) => setFormData({ ...formData, bio: e.target.value })}
                        disabled={isLoading}
                        className="h-12 px-4 focus-visible:ring-emerald-500 text-base"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Specialization</label>
                        <Input
                            placeholder="Anxiety, Depression"
                            value={formData?.specialization || ""}
                            onChange={(e: any) => setFormData({ ...formData, specialization: e.target.value })}
                            disabled={isLoading}
                            className="h-12 px-4 focus-visible:ring-emerald-500 text-base"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Languages</label>
                        <Input
                            placeholder="English, Spanish"
                            value={formData?.languages || ""}
                            onChange={(e: any) => setFormData({ ...formData, languages: e.target.value })}
                            disabled={isLoading}
                            className="h-12 px-4 focus-visible:ring-emerald-500 text-base"
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-(family-name:--font-outfit) font-semibold h-11 text-lg rounded-xl transition-all shadow-sm"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating Profile..." : "Complete Registration"}
                </Button>
            </form>
        </div>
    )
}