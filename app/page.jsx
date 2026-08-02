import LandingNavbar from "@/components/landing/navbar";
import LandingHero from "@/components/landing/hero";
import GameModes from "@/components/landing/game-modes";
import LiveArena from "@/components/landing/live-arena";
import HowItWorks from "@/components/landing/how-it-works";
import MobileLanding from "@/components/home/mobile-landing";

function DesktopLanding() {
  return (
    <div className="min-h-screen bg-grid">
      <LandingNavbar />

      <main className="pt-28">
        <LandingHero />

        <GameModes />

        <LiveArena />

        <HowItWorks />
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Desktop / Tablet */}
      <div className="hidden md:block">
        <DesktopLanding />
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <MobileLanding />
      </div>
    </>
  );
}