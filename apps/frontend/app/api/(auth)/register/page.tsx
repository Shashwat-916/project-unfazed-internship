import RegistrationNavBar from "@/components/custom/registration/RegistrationNavBar";
import { RegistrationStepper } from "@/components/custom/registration/RegistrationStepper";


export default function RegisterPage() {
    return <>
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            <RegistrationNavBar />
            <div className="flex-1 flex justify-center w-full pt-10 md:pt-16 pb-20">
                <RegistrationStepper />
            </div>
        </div>
    </>
}