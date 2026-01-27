import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, Users, Ship, Calendar, TrendingUp, Percent } from "lucide-react";

interface Stats {
  totalRevenue: number;
  totalBookings: number;
  totalYachts: number;
  confirmedBookings: number;
  pendingBookings: number;
  boardedBookings: number;
  cancelledBookings: number;
  occupancyRate: number;
}

const DashboardStats = () => {
  const { user, isAdmin, isOwner } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      setIsLoading(true);

      // Fetch bookings
      let bookingsQuery = supabase.from("bookings").select("*");
      
      // If owner, only fetch their yacht bookings
      if (isOwner && !isAdmin) {
        const { data: userYachts } = await supabase
          .from("yachts")
          .select("id")
          .eq("owner_id", user.id);
        
        const yachtIds = userYachts?.map(y => y.id) || [];
        if (yachtIds.length > 0) {
          bookingsQuery = bookingsQuery.in("yacht_id", yachtIds);
        }
      }

      const { data: bookings } = await bookingsQuery;

      // Fetch yachts count
      let yachtsQuery = supabase.from("yachts").select("id", { count: "exact" });
      if (isOwner && !isAdmin) {
        yachtsQuery = yachtsQuery.eq("owner_id", user.id);
      }
      const { count: yachtCount } = await yachtsQuery;

      // Calculate stats
      const confirmedBookings = bookings?.filter(b => b.status === "confirmed").length || 0;
      const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
      const boardedBookings = bookings?.filter(b => b.status === "boarded").length || 0;
      const cancelledBookings = bookings?.filter(b => b.status === "cancelled").length || 0;
      
      const activeBookings = bookings?.filter(b => b.status !== "cancelled") || [];
      const totalRevenue = activeBookings.reduce((sum, b) => sum + Number(b.total_price), 0);
      
      const totalSlots = (yachtCount || 0) * 30; // Assume 30 days average
      const bookedSlots = confirmedBookings + boardedBookings;
      const occupancyRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

      setStats({
        totalRevenue,
        totalBookings: bookings?.length || 0,
        totalYachts: yachtCount || 0,
        confirmedBookings,
        pendingBookings,
        boardedBookings,
        cancelledBookings,
        occupancyRate: Math.min(100, occupancyRate),
      });

      setIsLoading(false);
    };

    fetchStats();
  }, [user, isAdmin, isOwner]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">EGP {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From all active bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time reservations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Yachts</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalYachts}</div>
            <p className="text-xs text-muted-foreground">Listed on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Boarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.boardedBookings}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelledBookings}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
