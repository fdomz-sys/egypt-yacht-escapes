import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import YachtCard from "@/components/yacht/YachtCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { yachts, locations, activityTypes, Location, ActivityType } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Search, X } from "lucide-react";

const YachtsPage = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<Location | "all">(
    (searchParams.get("location") as Location) || "all"
  );
  const [type, setType] = useState<ActivityType | "all">(
    (searchParams.get("type") as ActivityType) || "all"
  );
  const [maxPrice, setMaxPrice] = useState([5000]);
  const [minCapacity, setMinCapacity] = useState([1]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredYachts = useMemo(() => {
    return yachts.filter((yacht) => {
      const name = language === "ar" ? yacht.nameAr : yacht.name;
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchesLocation = location === "all" || yacht.location === location;
      const matchesType = type === "all" || yacht.type === type;
      const matchesPrice = yacht.pricePerPerson <= maxPrice[0];
      const matchesCapacity = yacht.capacity >= minCapacity[0];
      
      return matchesSearch && matchesLocation && matchesType && matchesPrice && matchesCapacity;
    });
  }, [search, location, type, maxPrice, minCapacity, language]);

  const clearFilters = () => {
    setSearch("");
    setLocation("all");
    setType("all");
    setMaxPrice([5000]);
    setMinCapacity([1]);
    setSearchParams({});
  };

  const hasActiveFilters = location !== "all" || type !== "all" || maxPrice[0] < 5000 || minCapacity[0] > 1;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Location */}
      <div className="space-y-2">
        <Label>{t("listings.filter.location")}</Label>
        <Select value={location} onValueChange={(val) => setLocation(val as Location | "all")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("listings.filter.all")}</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {language === "ar" ? loc.nameAr : loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>{t("listings.filter.type")}</Label>
        <Select value={type} onValueChange={(val) => setType(val as ActivityType | "all")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("listings.filter.all")}</SelectItem>
            {activityTypes.map((act) => (
              <SelectItem key={act.id} value={act.id}>
                {language === "ar" ? act.nameAr : act.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Max Price */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>{t("listings.filter.price")}</Label>
          <span className="text-sm text-muted-foreground">{maxPrice[0]} EGP</span>
        </div>
        <Slider
          value={maxPrice}
          onValueChange={setMaxPrice}
          min={100}
          max={5000}
          step={100}
        />
      </div>

      {/* Min Capacity */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>{t("listings.filter.capacity")}</Label>
          <span className="text-sm text-muted-foreground">{minCapacity[0]}+ guests</span>
        </div>
        <Slider
          value={minCapacity}
          onValueChange={setMinCapacity}
          min={1}
          max={25}
          step={1}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {t("listings.title")}
            </h1>
            <p className="text-muted-foreground">
              {filteredYachts.length} results found
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold mb-6">Filters</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search & Mobile Filter */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search yachts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <h2 className="font-semibold mb-6">Filters</h2>
                    <FilterContent />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Results Grid */}
              {filteredYachts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredYachts.map((yacht) => (
                    <YachtCard key={yacht.id} yacht={yacht} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    {t("listings.noResults")}
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default YachtsPage;
