import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { locations } from "@/lib/data";
import { MapPin, ArrowRight } from "lucide-react";

const locationImages: Record<string, string> = {
  "marsa-matruh": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
  "north-coast": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=400&fit=crop",
  "alexandria": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
  "el-gouna": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
};

const Locations = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("locations.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("locations.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {locations.map((location) => (
            <Link
              key={location.id}
              to={`/yachts?location=${location.id}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden"
            >
              <img
                src={locationImages[location.id]}
                alt={language === "ar" ? location.nameAr : location.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 text-primary-foreground/80 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Egypt</span>
                </div>
                <h3 className="text-2xl font-bold text-primary-foreground mb-1">
                  {language === "ar" ? location.nameAr : location.name}
                </h3>
                <p className="text-sm text-primary-foreground/70 mb-4">
                  {location.description}
                </p>
                <div className="flex items-center gap-2 text-primary-foreground font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Locations;
