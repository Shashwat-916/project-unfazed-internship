"use client"
import { useState } from "react"
import { Stepper, StepperContent, StepperIndicator, StepperItem, StepperNav, StepperPanel, StepperSeparator, StepperTrigger } from "@/components/reui/stepper"
import { CheckIcon, LoaderCircleIcon } from 'lucide-react'
import RegistrationSendOtpStep from "./Registration.SendOtp"
import RegistrationVerifyOtpStep from "./Registration.VerifyOtp"
import RegistrationChooseRole from "./Registration.ChooseRole"
import RegistrationClientFormStep from "./Registration.ClientForm"
import RegistrationTherapistFormStep from "./Registration.TherapistForm"
import { useAuthContext } from "@/context/useAuthContext"
import { useRouter } from "next/navigation"
import { Alert, AlertTitle, AlertDescription } from "@/components/reui/alert"

const steps = [1, 2, 3, 4]

export function RegistrationStepper() {
    const [currentStep, setCurrentStep] = useState(1);
    const [role, setRole] = useState<"CLIENT" | "THERAPIST" | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // OTP states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");

    // Form states
    const [clientData, setClientData] = useState({ name: "", phoneNumber: "" });
    const [therapistData, setTherapistData] = useState({ name: "", phoneNumber: "", bio: "", specialization: "", languages: "" });

    // Alert states
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const { authService, login } = useAuthContext();
    const router = useRouter();

    const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
    const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const handleSendOtpSubmit = async () => {
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            await authService.sendOtp({ email });
            setSuccessMsg("OTP sent successfully!");
            setTimeout(() => { setSuccessMsg(""); handleNext(); }, 1500);
        } catch (error: any) {
            console.error(error);
            setErrorMsg(error?.response?.data?.message || "Failed to send OTP.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            await authService.verifyOtp({ email, otp });
            setSuccessMsg("OTP verified successfully!");
            setTimeout(() => { setSuccessMsg(""); handleNext(); }, 1500);
        } catch (error: any) {
            console.error(error);
            setErrorMsg(error?.response?.data?.message || "Failed to verify OTP.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleClientSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            const res = await authService.registerClient({
                email,
                password,
                name: clientData.name,
                phoneNumber: clientData.phoneNumber
            });
            if (res.token && res.user) {
                login(res.token, res.user);
            }
            setSuccessMsg("Client Registration Complete! Redirecting...");
            setTimeout(() => router.push("/"), 1500);
        } catch (error: any) {
            console.error(error);
            setErrorMsg(error?.response?.data?.message || "Failed to register client.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleTherapistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            const res = await authService.registerTherapist({
                email,
                password,
                name: therapistData.name,
                phoneNumber: therapistData.phoneNumber,
                bio: therapistData.bio,
                specialization: therapistData.specialization,
                languages: therapistData.languages
            });
            if (res.token && res.user) {
                login(res.token, res.user);
            }
            setSuccessMsg("Therapist Registration Complete! Redirecting...");
            setTimeout(() => router.push("/"), 1500);
        } catch (error: any) {
            console.error(error);
            setErrorMsg(error?.response?.data?.message || "Failed to register therapist.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 lg:px-12 flex flex-col items-center">
            <Stepper
                className="w-full flex flex-col items-center"
                value={currentStep}
                onValueChange={(val) => setCurrentStep(val)}
                indicators={{
                    completed: (
                        <CheckIcon className="size-3.5" />
                    ),
                    loading: (
                        <LoaderCircleIcon className="size-3.5 animate-spin" />
                    ),
                }}
            >
                <StepperNav className="mb-8 w-full max-w-xl mx-auto flex justify-center items-center">
                    {steps.map((step) => (
                        <StepperItem key={step} step={step} className={step < steps.length ? "flex-1" : ""} loading={isLoading && currentStep === step}>
                            <StepperTrigger>
                                <StepperIndicator className="data-[state=active]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=inactive]:border-muted size-5 border-2 data-[state=completed]:border-green-500 data-[state=completed]:bg-green-500 data-[state=completed]:text-white">
                                    <span className="bg-primary-foreground hidden size-1.5 rounded-full group-data-[state=active]/step:block"></span>
                                </StepperIndicator>
                            </StepperTrigger>
                            {steps.length > step && (
                                <StepperSeparator className="group-data-[state=completed]/step:bg-green-500 w-full" />
                            )}
                        </StepperItem>
                    ))}
                </StepperNav>
                
                <div className="w-full max-w-xl mx-auto mb-6">
                    {errorMsg && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errorMsg}</AlertDescription>
                        </Alert>
                    )}
                    {successMsg && (
                        <Alert variant="success">
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{successMsg}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <StepperPanel className="text-sm w-full">
                    {steps.map((step) => (
                        <StepperContent
                            className="w-full flex justify-center"
                            key={step}
                            value={step}
                        >
                            <div className="w-full max-w-2xl">
                                {step === 1 && (
                                    <RegistrationSendOtpStep
                                        email={email}
                                        setEmail={setEmail}
                                        password={password}
                                        setPassword={setPassword}
                                        isLoading={isLoading}
                                        onSubmit={handleSendOtpSubmit}
                                    />
                                )}
                                {step === 2 && (
                                    <RegistrationVerifyOtpStep
                                        email={email}
                                        otp={otp}
                                        setOtp={setOtp}
                                        isLoading={isLoading}
                                        onSubmit={handleVerifyOtpSubmit}
                                        onBack={handleBack}
                                    />
                                )}
                                {step === 3 && (
                                    <RegistrationChooseRole
                                        role={role}
                                        setRole={setRole}
                                        onNext={handleNext}
                                    />
                                )}
                                {step === 4 && role === "CLIENT" && (
                                    <RegistrationClientFormStep
                                        formData={clientData}
                                        setFormData={setClientData}
                                        isLoading={isLoading}
                                        onSubmit={handleClientSubmit}
                                    />
                                )}
                                {step === 4 && role === "THERAPIST" && (
                                    <RegistrationTherapistFormStep
                                        formData={therapistData}
                                        setFormData={setTherapistData}
                                        isLoading={isLoading}
                                        onSubmit={handleTherapistSubmit}
                                    />
                                )}
                            </div>
                        </StepperContent>
                    ))}
                </StepperPanel>
            </Stepper>
        </div>
    )
}