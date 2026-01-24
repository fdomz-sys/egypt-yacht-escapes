import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Anchor, Waves, ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-yacht.jpg";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury yacht on Mediterranean waters"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-foreground/60" />
      </div>

      {/* Animated Wave Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full animate-wave"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 60C960 50 1056 40 1152 45C1248 50 1344 70 1392 80L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
            className="fill-background"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-md border border-primary-foreground/20 rounded-full px-4 py-2 text-primary-foreground">
            <Anchor className="h-4 w-4" />
            <span className="text-sm font-medium">Premium Water Experiences</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
            {t("hero.title")}
            <br />
            <span className="text-primary-foreground/90">{t("hero.subtitle")}</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            {t("hero.description")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              asChild
              className="min-w-[200px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
            >
              <Link to="/yachts" className="flex items-center gap-2">
                <Anchor className="h-5 w-5" />
                {t("hero.cta.yacht")}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="min-w-[200px] bg-card/20 backdrop-blur-md border-primary-foreground/30 text-primary-foreground hover:bg-card/30"
            >
              <Link to="/yachts?type=jet-ski" className="flex items-center gap-2">
                <Waves className="h-5 w-5" />
                {t("hero.cta.activities")}
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto pt-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground">50+</p>
              <p className="text-sm text-primary-foreground/70">Yachts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground">4</p>
              <p className="text-sm text-primary-foreground/70">Locations</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground">10K+</p>
              <p className="text-sm text-primary-foreground/70">Happy Guests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 animate-bounce text-primary-foreground/70">
        <ChevronDown className="h-8 w-8" />
      </div>
    </section>
  );
};

export default Hero;
