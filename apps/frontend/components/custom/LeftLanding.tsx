

import AnimatedText from "./AnimatedText";

export default function LeftLandingBanner() {
    return (
        <div className="flex flex-1 flex-col items-center lg:items-start w-full">
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 sm:gap-3">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                    SUPPORT
                </h1>

                <div className="text-3xl sm:text-4xl md:text-5xl">
                    <AnimatedText />
                </div>
            </div>

            <p className="mt-6 max-w-xl font-outfit text-lg font-medium leading-8 text-slate-600 md:text-xl">
                Talk to someone who understands. Connect with trusted therapists,
                find the support you need, and take a meaningful step toward a
                healthier, calmer you.
            </p>
        </div>
    );
}