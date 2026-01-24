import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Yacht, formatPrice, getLocationName, getActivityTypeName } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, MapPin, Clock } from "lucide-react";

interface YachtCardProps {
  yacht: Yacht;
}

const YachtCard = ({ yacht }: YachtCardProps) => {
  const { t, language } = useLanguage();

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={yacht.image}
          alt={language === "ar" ? yacht.nameAr : yacht.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
            {getActivityTypeName(yacht.type)}
          </Badge>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{yacht.rating}</span>
          <span className="text-xs text-muted-foreground">({yacht.reviewCount})</span>
        </div>

        {/* Location */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-primary-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">{getLocationName(yacht.location)}</span>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold line-clamp-1">
            {language === "ar" ? yacht.nameAr : yacht.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {language === "ar" ? yacht.descriptionAr : yacht.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{yacht.capacity} {t("listings.capacity")}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatPrice(yacht.pricePerHour)} {t("listings.perHour")}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <span className="text-xl font-bold text-primary">
              {formatPrice(yacht.pricePerPerson)}
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
