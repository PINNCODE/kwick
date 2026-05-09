import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { BenefitsSection } from './components/landing/BenefitsSection';
import { AppPreviewSection } from './components/landing/AppPreviewSection';
import { HowItWorksSection } from './components/landing/HowItWorksSection';
import { FinalCTA } from './components/landing/FinalCTA';
import { Footer } from './components/landing/Footer';
import { AuthRedirectBanner } from './components/landing/AuthRedirectBanner';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <AuthRedirectBanner />
      <Hero />
      <BenefitsSection />
      <AppPreviewSection />
      <HowItWorksSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
