// src/app/page.tsx
// Landing / Home page — NexCore ERP
// Route: /  (root)

import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingModules from '@/components/landing/LandingModules';
import LandingWorkflow from '@/components/landing/LandingWorkflow';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingStack from '@/components/landing/LandingStack';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';
import LandingScrollReveal from '@/components/landing/LandingScrollReveal';

export default function HomePage() {
  return (
    <>
      <LandingNav />
      <main>
        <LandingHero />
        <LandingModules />
        <LandingWorkflow />
        <LandingFeatures />
        <LandingStack />
        <LandingCTA />
      </main>
      <LandingFooter />
      {/* Client component — handles scroll reveal + counter animations */}
      <LandingScrollReveal />
    </>
  );
}