"use client"

import { Button } from "@/components/ui/button"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { ShieldCheck } from "lucide-react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export interface RegistrationVerifyOtpUIProps {
    email: string
    otp: string
    setOtp: (otp: string) => void
    isLoading: boolean
    onSubmit: (e: React.FormEvent) => void
    onBack: () => void
}

export default function RegistrationVerifyOtpStep({ email, otp, setOtp, isLoading, onSubmit, onBack }: RegistrationVerifyOtpUIProps) {
    return (
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Verify your email</h2>
                <p className="text-slate-500 max-w-sm mx-auto">
                    We've sent a 6-digit verification code to <span className="font-semibold text-slate-800">{email}</span>
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-4 flex flex-col items-center">
                    <label className="text-sm font-medium text-slate-700 w-full text-left">Verification Code</label>
                    <div className="flex items-center justify-center w-full">
                        <InputOTP 
                            id="digits-only" 
                            maxLength={6} 
                            pattern={REGEXP_ONLY_DIGITS}
                            value={otp}
                            onChange={(val) => setOtp(val)}
                            disabled={isLoading}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="w-1/3 h-11"
                        disabled={isLoading}
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-11 transition-all shadow-sm"
                        disabled={isLoading}
                    >
                        {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>
                </div>
            </form>
        </div>
    )
}