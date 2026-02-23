import { tid } from "@/shared/application/utils/tid";
import { NavigationBar } from "./components/NavigationBar";
import { SakuraParticles } from "./components/SakuraParticles";
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
    <div {...tid("convention-page")}>
      <NavigationBar />
      <SakuraParticles />
      <HeroSection />
      <AboutSection />
      <EventsSection />
      <GuestsSection />
      <VenueSection />
      <RegistrationSection />
      <FaqSection />
      <FooterSection />
    </div>
  );
}
