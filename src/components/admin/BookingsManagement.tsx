import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, Search, X, Eye, QrCode } from "lucide-react";

interface BookingWithDetails {
  id: string;
  booking_reference: string;
  date: string;
  time_slot: string;
  seats: number;
  subtotal: number;
  platform_fee: number;
  total_price: number;
  payment_method: string;
  status: "pending" | "confirmed" | "cancelled" | "boarded";
  qr_code_data: string | null;
  created_at: string;
  yacht: {
    name: string;
    location: string;
  } | null;
  profile: {
    name: string | null;
    email: string;
    phone: string | null;
  } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  boarded: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const locationNames: Record<string, string> = {
  "marsa-matruh": "Marsa Matruh",
  "north-coast": "North Coast",
  "alexandria": "Alexandria",
  "el-gouna": "El Gouna",
};

const BookingsManagement = () => {
  const { user, isAdmin } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = async () => {
    if (!user) return;

    setIsLoading(true);

    // First fetch bookings with yacht data
    const { data: bookingsData, error } = await supabase
      .from("bookings")
      .select(`
        *,
        yacht:yachts(name, location)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
      setIsLoading(false);
      return;
    }

    // Fetch profiles for all unique user_ids
    const userIds = [...new Set(bookingsData?.map(b => b.user_id) || [])];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, name, email, phone")
      .in("id", userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

    // Combine data
    const combined = (bookingsData || []).map(booking => ({
      ...booking,
      profile: profilesMap.get(booking.user_id) || null,
    }));

    setBookings(combined as BookingWithDetails[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setIsCancelling(true);

    const { data, error } = await supabase.rpc("cancel_booking", {
      p_booking_id: selectedBooking.id,
    });

    if (error) {
      toast.error(error.message);
    } else {
      const result = data?.[0];
      if (result?.success) {
        toast.success("Booking cancelled successfully");
        fetchBookings();
      } else {
        toast.error(result?.error_message || "Failed to cancel");
      }
    }

    setIsCancelling(false);
    setShowCancelDialog(false);
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.yacht?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesLocation = locationFilter === "all" || booking.yacht?.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bookings Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference, name, email, yacht..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="boarded">Boarded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="marsa-matruh">Marsa Matruh</SelectItem>
                <SelectItem value="north-coast">North Coast</SelectItem>
                <SelectItem value="alexandria">Alexandria</SelectItem>
                <SelectItem value="el-gouna">El Gouna</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Yacht</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-sm">{booking.booking_reference}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.profile?.name || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">{booking.profile?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.yacht?.name || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">
                            {locationNames[booking.yacht?.location || ""] || booking.yacht?.location}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{format(new Date(booking.date), "MMM d, yyyy")}</p>
                          <p className="text-xs text-muted-foreground">{booking.time_slot}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.seats}</TableCell>
                      <TableCell>EGP {Number(booking.total_price).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[booking.status]}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(booking.status === "pending" || booking.status === "confirmed") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowCancelDialog(true);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Booking Dialog */}
      <Dialog open={!!selectedBooking && !showCancelDialog} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Reference</p>
                  <p className="font-mono font-bold">{selectedBooking.booking_reference}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedBooking.status]}>
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Client Name</p>
                  <p className="font-medium">{selectedBooking.profile?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedBooking.profile?.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedBooking.profile?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{selectedBooking.payment_method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.date), "MMM d, yyyy")} at {selectedBooking.time_slot}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Guests</p>
                  <p className="font-medium">{selectedBooking.seats}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>EGP {Number(selectedBooking.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span>EGP {Number(selectedBooking.platform_fee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>EGP {Number(selectedBooking.total_price).toLocaleString()}</span>
                </div>
              </div>

              {selectedBooking.qr_code_data && (
                <div className="flex justify-center pt-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedBooking.qr_code_data)}`}
                    alt="Booking QR Code"
                    className="rounded-lg border"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel booking {selectedBooking?.booking_reference}? 
              This will restore the available slots.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isCancelling}
            >
              {isCancelling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsManagement;
