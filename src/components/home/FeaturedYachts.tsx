import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { yachts } from "@/lib/data";
import YachtCard from "@/components/yacht/YachtCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedYachts = () => {
  const { t } = useLanguage();
  const featured = yachts.slice(0, 3);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Featured Yachts
            </h2>
            <p className="text-muted-foreground">
              Handpicked selection of our finest vessels
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/yachts" className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((yacht) => (
            <YachtCard key={yacht.id} yacht={yacht} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedYachts;
