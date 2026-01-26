import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, MapPin, Clock } from "lucide-react";
import yacht1 from "@/assets/yacht-1.jpg";

interface YachtCardProps {
  yacht: {
    id: string;
    name: string;
    name_ar?: string | null;
    type: string;
    location: string;
    capacity: number;
    price_per_person: number;
    price_per_hour: number;
    description?: string | null;
    description_ar?: string | null;
    image_urls?: string[] | null;
    rating?: number | null;
    review_count?: number | null;
  };
}

const locationNames: Record<string, string> = {
  "marsa-matruh": "Marsa Matruh",
  "north-coast": "North Coast",
  "alexandria": "Alexandria",
  "el-gouna": "El Gouna",
};

const typeNames: Record<string, string> = {
  "private-yacht": "Private Yacht",
  "shared-trip": "Shared Trip",
  "jet-ski": "Jet Ski",
  "speed-boat": "Speed Boat",
  "catamaran": "Catamaran",
};

const YachtCard = ({ yacht }: YachtCardProps) => {
  const { t, language } = useLanguage();
  const image = yacht.image_urls?.[0] || yacht1;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={language === "ar" ? (yacht.name_ar || yacht.name) : yacht.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
            {typeNames[yacht.type] || yacht.type}
          </Badge>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{yacht.rating || 0}</span>
          <span className="text-xs text-muted-foreground">({yacht.review_count || 0})</span>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-primary-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">{locationNames[yacht.location] || yacht.location}</span>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold line-clamp-1">
            {language === "ar" ? (yacht.name_ar || yacht.name) : yacht.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {language === "ar" ? (yacht.description_ar || yacht.description) : yacht.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{yacht.capacity} {t("listings.capacity")}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatPrice(Number(yacht.price_per_hour))} {t("listings.perHour")}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <span className="text-xl font-bold text-primary">
              {formatPrice(Number(yacht.price_per_person))}
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              {t("listings.perPerson")}
            </span>
          </div>
          <Button asChild size="sm">
            <Link to={`/yacht/${yacht.id}`}>{t("listings.viewDetails")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default YachtCard;
