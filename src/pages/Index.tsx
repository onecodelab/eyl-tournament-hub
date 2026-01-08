import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { FeaturedTournaments } from "@/components/home/FeaturedTournaments";
import { UpcomingMatches } from "@/components/home/UpcomingMatches";
import { SeasonHighlights } from "@/components/home/SeasonHighlights";
import { LatestNewsSection } from "@/components/home/LatestNewsSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PartnersSection />
      <FeaturedTournaments />
      <UpcomingMatches />
      <SeasonHighlights />
      <LatestNewsSection />
    </Layout>
  );
};

export default Index;
