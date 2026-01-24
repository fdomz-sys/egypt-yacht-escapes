import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import Locations from "@/components/home/Locations";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedYachts from "@/components/home/FeaturedYachts";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Locations />
      <FeaturedYachts />
      <HowItWorks />
    </Layout>
  );
};

export default Index;
