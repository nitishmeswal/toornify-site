import LandingNavbar from "@/components/landing/LandingNavbar";
import Hero from "@/components/landing/Hero";
import TrustedBy from "@/components/landing/TrustedBy";
import StatsBar from "@/components/landing/StatsBar";
import AudienceCards from "@/components/landing/AudienceCards";
import PlatformShowcase from "@/components/landing/PlatformShowcase";
import Features from "@/components/landing/Features";
import LiveTournaments from "@/components/landing/LiveTournaments";
import RoadmapAndCommunity from "@/components/landing/RoadmapAndCommunity";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";
import SEO from "@/components/SEO";

export default function HomeNew() {
  return (
    // bg removed: <GlobalBackground /> in App.tsx paints the video + lasers
    // behind every page globally. relative z-10 stacks this content above it.
    <div className="min-h-screen text-white overflow-x-hidden relative z-10">
      <SEO />
      <LandingNavbar />
      <main>
        <Hero />
        <TrustedBy />
        <StatsBar />
        <AudienceCards />
        <PlatformShowcase />
        <Features />
        <LiveTournaments />
        <RoadmapAndCommunity />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
