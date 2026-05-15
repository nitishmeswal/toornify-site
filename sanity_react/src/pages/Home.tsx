import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import SEO from "@/components/SEO";
import LiquidEther from "@/components/LiquidEther";

export function Home() {
  return (
    <main className="relative">
      <SEO />
      {/* LiquidEther background */}
      <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B497CF']}
          mouseForce={20}
          cursorSize={100}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          color0="#5227FF"
          color1="#FF9FFC"
          color2="#B497CF"
        />
      </div>
      <div className="relative" style={{ zIndex: 1 }}>
        <HeroSection />
        <div id="feature-section">
          <FeatureSection />
        </div>
      </div>
    </main>
  );
}
