import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { yachts, formatPrice, getLocationName, generateBookingId, calculatePlatformFee, Booking } from "@/lib/data";
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
  ChevronRight,
  QrCode,
} from "lucide-react";

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-4 w-4" />,
  Kitchen: <UtensilsCrossed className="h-4 w-4" />,
  AC: <Wind className="h-4 w-4" />,
};

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

const YachtDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, addBooking } = useAuth();

  const yacht = yachts.find((y) => y.id === id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("online");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<Booking | null>(null);

  if (!yacht) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Yacht not found</p>
        </div>
      </Layout>
    );
  }

  const subtotal = yacht.pricePerPerson * guests;
  const platformFee = calculatePlatformFee(subtotal);
  const total = subtotal + platformFee;

  const handleBooking = () => {
    if (!user) {
      toast.error("Please login to make a booking");
      navigate("/auth?mode=login");
      return;
    }

    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }

    const booking: Booking = {
      id: generateBookingId(),
      yachtId: yacht.id,
      yachtName: yacht.name,
      date: format(date, "yyyy-MM-dd"),
      time,
      guests,
      totalPrice: total,
      platformFee,
      paymentMethod,
      status: "confirmed",
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SEASCAPE-${generateBookingId()}`,
      location: yacht.location,
      createdAt: new Date().toISOString(),
    };

    addBooking(booking);
    setBookingData(booking);
    setShowConfirmation(true);
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
                    src={yacht.images[selectedImage]}
                    alt={yacht.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {yacht.images.map((img, idx) => (
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
                      {language === "ar" ? yacht.nameAr : yacht.name}
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{getLocationName(yacht.location)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{yacht.rating}</span>
                        <span>({yacht.reviewCount} {t("details.reviews")})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(yacht.pricePerPerson)}
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
                    {formatPrice(yacht.pricePerHour)} {t("listings.perHour")}
                  </Badge>
                </div>

                {/* Description */}
                <div>
                  <p className="text-muted-foreground">
                    {language === "ar" ? yacht.descriptionAr : yacht.description}
                  </p>
                </div>

                {/* What's Included */}
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

                {/* Amenities */}
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
                        onClick={() => setGuests(Math.min(yacht.capacity, guests + 1))}
                      >
                        +
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        (max {yacht.capacity})
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

                  <Button className="w-full" size="lg" onClick={handleBooking}>
                    {t("booking.confirm")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🎉 {t("booking.success")}
            </DialogTitle>
          </DialogHeader>
          {bookingData && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">{t("booking.reference")}</p>
                <p className="text-2xl font-mono font-bold text-primary">{bookingData.id}</p>
              </div>

              <div className="flex justify-center">
                <img
                  src={bookingData.qrCode}
                  alt="Booking QR Code"
                  className="w-48 h-48 rounded-lg border"
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yacht</span>
                  <span className="font-medium">{bookingData.yachtName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{bookingData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{bookingData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-medium">{bookingData.guests}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-primary">{formatPrice(bookingData.totalPrice)}</span>
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
