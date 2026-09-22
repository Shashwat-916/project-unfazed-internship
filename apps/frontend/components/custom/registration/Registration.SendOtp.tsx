"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export interface RegistrationSendOtpStepProps {
    email: string
    password: string
    setEmail: (email: string) => void
    setPassword: (password: string) => void
    isLoading: boolean
    onSubmit: () => void
}

export default function RegistrationSendOtpStep({ email, password, setEmail, setPassword, isLoading, onSubmit }: RegistrationSendOtpStepProps) {

    return (
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h2>
                <p className="text-slate-500 max-w-sm mx-auto">
                    Enter your email and create a password to get started.
                </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email address</label>
                        <Input
                            placeholder="name@gmail.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="h-12 px-4 focus-visible:ring-emerald-500 text-base"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <Input
                            placeholder="Create a password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="h-12 px-4 focus-visible:ring-emerald-500 text-base"
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-(family-name:--font-outfit) font-semibold h-11 text-lg rounded-xl transition-all shadow-sm"
                    disabled={isLoading}
                >
                    {isLoading ? "Sending Code..." : "Continue with Email"}
                </Button>
            </form>
        </div>
    )
}