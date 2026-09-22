import Image from "next/image";

import LandingBanner from "@/components/custom/LandingBanner";
import LandingNavBar from "@/components/custom/LandingNavBar";

export default function HomePage() {
  return (
    <div>
      <LandingNavBar />
      <LandingBanner />
    </div>
  );
}