"use client";

import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ResearchSection from "@/components/sections/ResearchSection";
import RoboticsSection from "@/components/sections/RoboticsSection";
import MLOpsSection from "@/components/sections/MLOpsSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ResearchSection />
      <RoboticsSection />
      <MLOpsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
