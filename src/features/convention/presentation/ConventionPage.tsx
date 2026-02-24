import { tid } from "@/shared/application/utils/tid";
import { NavigationBar } from "./components/NavigationBar";
import { SakuraParticles } from "./components/SakuraParticles";
import { HeroCanvasSky } from "./components/HeroCanvasSky";
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { EventsSection } from "./sections/EventsSection";
import { GuestsSection } from "./sections/GuestsSection";
import { VenueSection } from "./sections/VenueSection";
import { RegistrationSection } from "./sections/RegistrationSection";
import { FaqSection } from "./sections/FaqSection";
import { FooterSection } from "./sections/FooterSection";

export function Component() {
  return (
    <div className="relative isolate" {...tid("convention-page")}>
      <HeroCanvasSky fixed className="z-0" />
      <div className="relative z-10">
        <NavigationBar />
        <SakuraParticles />
        <div className="hero-sticky">
          <HeroSection />
        </div>
        <AboutSection />
        <EventsSection />
        <VenueSection />
        <RegistrationSection />
        <FaqSection />
        <GuestsSection />
        <FooterSection />
      </div>
    </div>
  );
}
