"use client"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export type Role = "CLIENT" | "THERAPIST";

export interface RegistrationChooseRoleProps {
    role: Role | null
    setRole: (role: Role) => void
    onNext: () => void
}

export default function RegistrationChooseRole({ role, setRole, onNext }: RegistrationChooseRoleProps) {

    return (
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Choose your role</h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Select how you would like to use the platform.
                </p>
            </div>

            <FieldGroup className="w-full space-y-4">
                <FieldLabel 
                    htmlFor="switch-client" 
                    className={`border rounded-xl p-4 transition-all block cursor-pointer ${role === "CLIENT" ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}
                >
                    <Field orientation="horizontal" className="w-full flex justify-between items-center gap-4">
                        <FieldContent>
                            <FieldTitle className="text-lg font-semibold text-slate-900">Client</FieldTitle>
                            <FieldDescription className="text-sm text-slate-500 mt-1">
                                I am looking for therapy and support.
                            </FieldDescription>
                        </FieldContent>
                        <Switch 
                            id="switch-client" 
                            checked={role === "CLIENT"}
                            onCheckedChange={() => setRole("CLIENT")}
                        />
                    </Field>
                </FieldLabel>

                <FieldLabel 
                    htmlFor="switch-therapist" 
                    className={`border rounded-xl p-4 transition-all block cursor-pointer ${role === "THERAPIST" ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}
                >
                    <Field orientation="horizontal" className="w-full flex justify-between items-center gap-4">
                        <FieldContent>
                            <FieldTitle className="text-lg font-semibold text-slate-900">Therapist</FieldTitle>
                            <FieldDescription className="text-sm text-slate-500 mt-1">
                                I want to provide therapy services.
                            </FieldDescription>
                        </FieldContent>
                        <Switch 
                            id="switch-therapist" 
                            checked={role === "THERAPIST"}
                            onCheckedChange={() => setRole("THERAPIST")}
                        />
                    </Field>
                </FieldLabel>
            </FieldGroup>

            <Button
                onClick={onNext}
                disabled={!role}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-11 transition-all shadow-sm rounded-xl mt-6"
            >
                Continue
            </Button>
        </div>
    )
}