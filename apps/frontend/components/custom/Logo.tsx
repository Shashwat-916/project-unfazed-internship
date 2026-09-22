import Image from "next/image"

export default function Logo() {
    return (
        <div>
            <Image 
                src="/logo.png"
                alt="LOGO"
                width={200}
                height={96}
                className="h-10 md:h-16 lg:h-24 w-auto object-contain"
            />
        </div>
    )
}