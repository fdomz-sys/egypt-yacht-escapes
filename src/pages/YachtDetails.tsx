import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useYacht, useAvailability } from "@/hooks/useYachts";
import { useBookings } from "@/hooks/useBookings";
import { formatPrice } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Star,
  Users,
  MapPin,
  Clock,
  Check,
  Wifi,
  UtensilsCrossed,
  Wind,
  Anchor,
  CalendarIcon,
  CreditCard,
  Wallet,
  ChevronLeft,
  Loader2,
} from "lucide-react";

// Default placeholder images
import yacht1 from "@/assets/yacht-1.jpg";
import yacht2 from "@/assets/yacht-2.jpg";
import yacht3 from "@/assets/yacht-3.jpg";

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-4 w-4" />,
  Kitchen: <UtensilsCrossed className="h-4 w-4" />,
  AC: <Wind className="h-4 w-4" />,
};

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

const locationNames: Record<string, string> = {
  "marsa-matruh": "Marsa Matruh",
  "north-coast": "North Coast (Sahel)",
  "alexandria": "Alexandria",
  "el-gouna": "El Gouna",
};

const YachtDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { yacht, isLoading: yachtLoading, error } = useYacht(id);
  const { createBooking } = useBookings();

  const [selectedImage, setSelectedImage] = useState(0);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("online");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<{ reference: string; qrData: string } | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const { slotsRemaining } = useAvailability(id, date);

  if (yachtLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !yacht) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Anchor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Yacht not found</p>
            <Button className="mt-4" onClick={() => navigate("/yachts")}>
              Browse Yachts
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Use yacht images or fallback to defaults
  const images = yacht.image_urls?.length ? yacht.image_urls : [yacht1, yacht2, yacht3];

  const subtotal = Number(yacht.price_per_person) * guests;
  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + platformFee;

  const maxGuests = slotsRemaining !== null ? Math.min(slotsRemaining, yacht.capacity) : yacht.capacity;

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please login to make a booking");
      navigate("/auth?mode=login");
      return;
    }

    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }

    if (guests > maxGuests) {
      toast.error(`Only ${maxGuests} spots available for this date`);
      return;
    }

    setIsBooking(true);

    try {
      const result = await createBooking(yacht.id, date, time, guests, paymentMethod);

      if (result.success && result.bookingReference) {
        const qrData = `SEASCAPE:${result.bookingReference}`;
        setBookingData({
          reference: result.bookingReference,
          qrData,
        });
        setShowConfirmation(true);
        // Updated message for pending payment status
        toast.success("Booking created! Awaiting payment confirmation.");
      } else {
        toast.error(result.error || "Booking failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/yachts")}
            className="mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="aspect-video rounded-2xl overflow-hidden">
                  <img
                    src={images[selectedImage]}
                    alt={yacht.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                        selectedImage === idx ? "border-primary" : "border-transparent"
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {language === "ar" ? yacht.name_ar || yacht.name : yacht.name}
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{locationNames[yacht.location] || yacht.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{yacht.rating || 0}</span>
                        <span>({yacht.review_count || 0} {t("details.reviews")})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(Number(yacht.price_per_person))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("listings.perPerson")}
                    </p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4">
                  <Badge variant="secondary" className="text-sm py-1.5 px-3">
                    <Users className="h-4 w-4 mr-2" />
                    {yacht.capacity} {t("listings.capacity")}
                  </Badge>
                  <Badge variant="secondary" className="text-sm py-1.5 px-3">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatPrice(Number(yacht.price_per_hour))} {t("listings.perHour")}
                  </Badge>
                  {date && slotsRemaining !== null && (
                    <Badge variant="outline" className="text-sm py-1.5 px-3">
                      {slotsRemaining} spots left
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className="text-muted-foreground">
                    {language === "ar" ? yacht.description_ar || yacht.description : yacht.description}
                  </p>
                </div>

                {/* What's Included */}
                {yacht.included && yacht.included.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t("details.included")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {yacht.included.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-accent" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Amenities */}
                {yacht.amenities && yacht.amenities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t("details.amenities")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {yacht.amenities.map((amenity, idx) => (
                          <Badge key={idx} variant="outline" className="py-1.5 px-3">
                            {amenityIcons[amenity] || <Anchor className="h-4 w-4 mr-2" />}
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Column - Booking */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{t("booking.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label>{t("booking.date")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <Label>{t("booking.time")}</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Guests */}
                  <div className="space-y-2">
                    <Label>{t("booking.guests")}</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                      >
                        -
                      </Button>
                      <span className="text-lg font-semibold w-8 text-center">{guests}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                        disabled={guests >= maxGuests}
                      >
                        +
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        (max {maxGuests})
                      </span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <Label>{t("booking.payment")}</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(val) => setPaymentMethod(val as "online" | "cash")}
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="h-4 w-4" />
                          {t("booking.online")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                          <Wallet className="h-4 w-4" />
                          {t("booking.cash")}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("booking.subtotal")}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t("booking.fee")}</span>
                      <span>{formatPrice(platformFee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>{t("booking.total")}</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleBooking}
                    disabled={isBooking}
                  >
                    {isBooking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t("booking.confirm")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog - Pending Payment Flow */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              📋 Booking Created
            </DialogTitle>
          </DialogHeader>
          {bookingData && (
            <div className="space-y-6 py-4">
              {/* Pending Payment Notice */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Payment Required</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Your booking is created but not valid until payment is confirmed.
                      Our team will contact you via WhatsApp or email to complete payment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground mb-2">{t("booking.reference")}</p>
                <p className="text-2xl font-mono font-bold text-primary">{bookingData.reference}</p>
              </div>

              {/* QR Code (Inactive) */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookingData.qrData)}`}
                    alt="Booking QR Code"
                    className="w-40 h-40 rounded-lg border opacity-50 grayscale"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-background/90 px-3 py-1 rounded-full text-xs font-medium text-muted-foreground border">
                      Inactive
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  QR code activates after payment confirmation
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yacht</span>
                  <span className="font-medium">{yacht.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{date ? format(date, "PPP") : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-medium">{guests}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setShowConfirmation(false);
                  navigate("/bookings");
                }}
              >
                View My Bookings
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default YachtDetails;
