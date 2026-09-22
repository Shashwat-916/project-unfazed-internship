import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import Link from "next/link";


export default function LandingNavigation() {
    return (
        <header
            className="sticky top-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 py-4 sm:py-6 lg:px-0 lg:justify-around border-b border-gray-200 transition-all duration-300 hover:bg-white/95"
        >
            <Logo />
            <div className="flex items-center gap-2">
                <Link href="/api/login">
                <Button
                    variant="ghost"
                    className="h-10 sm:h-11 font-outfit px-3 sm:px-5 text-sm sm:text-base font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                    Login
                </Button>
                </Link>

                <Link href="/api/register">
                <Button
                    className="h-10 sm:h-11 font-playfair rounded-xl bg-emerald-600 px-4 sm:px-6 text-sm sm:text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
                >
                    Register
                </Button>
                </Link>
            </div>
        </header>
    );
}