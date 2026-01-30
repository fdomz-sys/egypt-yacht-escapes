import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/hooks/useBookings";
import { formatPrice } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  Users,
  MapPin,
  QrCode,
  X,
  ChevronLeft,
  Anchor,
  Loader2,
} from "lucide-react";

const locationNames: Record<string, string> = {
  "marsa-matruh": "Marsa Matruh",
  "north-coast": "North Coast (Sahel)",
  "alexandria": "Alexandria",
  "el-gouna": "El Gouna",
};

const BookingsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { bookings, isLoading, cancelBooking } = useBookings();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth?mode=login");
    return null;
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status !== "cancelled" && b.status !== "used" && new Date(b.date) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "cancelled" || b.status === "used" || b.status === "boarded" || new Date(b.date) < new Date()
  );

  const handleCancel = async (bookingId: string) => {
    const result = await cancelBooking(bookingId);
    if (result.success) {
      toast.success("Booking cancelled successfully");
    } else {
      toast.error(result.error || "Failed to cancel booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending_payment":
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "used":
      case "boarded":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "Pending Payment";
      case "confirmed":
        return "Confirmed";
      case "used":
      case "boarded":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const generateQrUrl = (qrData: string | null) => {
    if (!qrData) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  };

  const BookingCard = ({ booking, showCancel = false }: { booking: typeof bookings[0]; showCancel?: boolean }) => {
    const isPendingPayment = booking.status === "pending_payment" || booking.status === "pending";
    const isConfirmed = booking.status === "confirmed";
    
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {/* Pending Payment Alert */}
          {isPendingPayment && (
            <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Awaiting Payment:</strong> Our team will contact you via WhatsApp or email to complete payment.
              </p>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{booking.yacht?.name || "Unknown Yacht"}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {locationNames[booking.yacht?.location || ""] || booking.yacht?.location}
                  </p>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {getStatusLabel(booking.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.time_slot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.seats} guests</span>
                </div>
                <div className="font-semibold text-primary">
                  {formatPrice(Number(booking.total_price))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono">{booking.booking_reference}</span>
                </div>
                {/* Only show active QR for confirmed bookings */}
                {isConfirmed && booking.qr_code_data && (
                  <a
                    href={generateQrUrl(booking.qr_code_data) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <QrCode className="h-4 w-4" />
                    View QR Code
                  </a>
                )}
                {/* Show inactive QR note for pending */}
                {isPendingPayment && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <QrCode className="h-4 w-4" />
                    QR activates after payment
                  </span>
                )}
              </div>
            </div>

            {showCancel && (booking.status === "confirmed" || isPendingPayment) && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleCancel(booking.id)}
              >
                <X className="h-4 w-4 mr-2" />
                {t("profile.cancel")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t("profile.bookings")}</h1>
            <p className="text-muted-foreground">
              Manage your yacht reservations
            </p>
          </div>

          <Tabs defaultValue="upcoming">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">
                {t("profile.upcoming")} ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                {t("profile.past")} ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} showCancel />
                ))
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Anchor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("profile.noBookings")}</p>
                    <Button className="mt-4" onClick={() => navigate("/yachts")}>
                      Browse Yachts
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground">No past bookings</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default BookingsPage;
