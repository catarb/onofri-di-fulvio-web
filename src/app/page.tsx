import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { ProfessionalsSection } from "@/components/professionals-section";
import { SpecialtiesSection } from "@/components/specialties-section";
import { ClinicSection } from "@/components/clinic-section";
import { AppointmentSection } from "@/components/appointment-section";
import { FaqSection } from "@/components/faq-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="divider-h shell opacity-50" />
      <AboutSection />
      <div className="divider-h shell opacity-50" />
      <ProfessionalsSection />
      <div className="divider-h shell opacity-50" />
      <SpecialtiesSection />
      <div className="divider-h shell opacity-50" />
      <ClinicSection />
      <div className="divider-h shell opacity-50" />
      <AppointmentSection />
      <FaqSection />
    </>
  );
}
