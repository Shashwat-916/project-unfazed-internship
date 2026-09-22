
import LeftLandingBanner from "./LeftLanding";
import RightLandingBanner from "./RightLanding";



export default function LandingBanner() {
    return (
        <section className="w-full">
            <div className="mx-auto flex flex-col lg:flex-row min-h-150 max-w-7xl items-center gap-10 px-6 py-12 lg:py-16 lg:px-8 text-center lg:text-left">
                <LeftLandingBanner />
                <RightLandingBanner />
            </div>
        </section>
    );
}