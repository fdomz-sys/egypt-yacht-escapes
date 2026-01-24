import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, getLocationName } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

const BookingsPage = () => {
  const { t } = useLanguage();
  const { user, bookings, cancelBooking } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth?mode=login");
    return null;
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.date) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "cancelled" || new Date(b.date) < new Date()
  );

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
    toast.success("Booking cancelled successfully");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-accent text-accent-foreground";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const BookingCard = ({ booking, showCancel = false }: { booking: typeof bookings[0]; showCancel?: boolean }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{booking.yachtName}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {getLocationName(booking.location)}
                </p>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{booking.guests} guests</span>
              </div>
              <div className="font-semibold text-primary">
                {formatPrice(booking.totalPrice)}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono">{booking.id}</span>
              </div>
              {booking.status === "confirmed" && (
                <a
                  href={booking.qrCode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <QrCode className="h-4 w-4" />
                  View QR Code
                </a>
              )}
            </div>
          </div>

          {showCancel && booking.status === "confirmed" && (
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
