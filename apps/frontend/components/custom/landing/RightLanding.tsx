import Image from "next/image";

export default function RightLandingBanner() {
    return (
        <div className="flex flex-1 justify-center lg:justify-end">
            <Image
                src="/landing.svg"
                alt="Unfazed"
                width={600}
                height={600}
                priority
                className="h-auto w-full max-w-xl"
            />
        </div>
    );
}