import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, Mail, Phone, User, CalendarDays, LogOut } from "lucide-react";

const ProfilePage = () => {
  const { t } = useLanguage();
  const { user, bookings, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth?mode=login");
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>

          <Card>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">{confirmedBookings}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Trips</p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg text-center">
                  <p className="text-3xl font-bold text-accent">{completedBookings}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/bookings")}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {t("nav.bookings")}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav.logout")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
