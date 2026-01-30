import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  XCircle, 
  User, 
  Ship, 
  Calendar, 
  Users, 
  Loader2,
  AlertTriangle,
  Clock,
  DollarSign,
  Phone,
  Mail
} from "lucide-react";

interface BookingInfo {
  booking_id: string;
  booking_reference: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  yacht_name: string;
  yacht_location: string;
  date: string;
  time_slot: string;
  seats: number;
  total_price: number;
  status: string;
  payment_method: string;
}

interface ScanResult {
  success: boolean;
  error_message: string | null;
  booking_info: BookingInfo | null;
}

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMarkingUsed, setIsMarkingUsed] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        () => {} // Ignore failures
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      toast.error("Failed to start camera. Please check permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Stop error:", err);
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    await stopScanner();
    await processQRCode(decodedText);
  };

  const processQRCode = async (qrData: string) => {
    setIsProcessing(true);
    setLastResult(null);

    const { data, error } = await supabase.rpc("scan_booking", {
      p_qr_code_data: qrData,
    });

    if (error) {
      setLastResult({
        success: false,
        error_message: error.message,
        booking_info: null,
      });
      toast.error(error.message);
    } else {
      // Parse the result - booking_info comes as Json type from the RPC
      const rawResult = data?.[0];
      if (rawResult) {
        const result: ScanResult = {
          success: rawResult.success,
          error_message: rawResult.error_message,
          booking_info: rawResult.booking_info as unknown as BookingInfo | null,
        };
        setLastResult(result);
        if (result.success) {
          toast.success("Valid booking found!");
        } else {
          toast.error(result.error_message || "Invalid QR code");
        }
      }
    }

    setIsProcessing(false);
  };

  const handleMarkAsUsed = async () => {
    if (!lastResult?.booking_info?.booking_id) return;
    
    setIsMarkingUsed(true);
    
    const { data, error } = await supabase.rpc("mark_booking_used", {
      p_booking_id: lastResult.booking_info.booking_id,
    });

    if (error) {
      toast.error(error.message);
    } else {
      const result = (data as { success: boolean; error_message: string | null }[])?.[0];
      if (result?.success) {
        toast.success("Guest checked in successfully!");
        // Update local state to show used status
        setLastResult({
          ...lastResult,
          success: false,
          error_message: "ALREADY USED - This booking has been used",
          booking_info: {
            ...lastResult.booking_info,
            status: "used",
          },
        });
      } else {
        toast.error(result?.error_message || "Failed to mark as used");
      }
    }
    
    setIsMarkingUsed(false);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      toast.error("Please enter a QR code");
      return;
    }
    await processQRCode(manualCode.trim());
    setManualCode("");
  };

  const resetScanner = () => {
    setLastResult(null);
    setManualCode("");
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const getStatusDisplay = () => {
    if (!lastResult) return null;
    
    const { success, error_message, booking_info } = lastResult;
    
    if (success) {
      return {
        icon: <CheckCircle2 className="h-8 w-8" />,
        title: "VALID BOOKING",
        subtitle: "Ready for boarding",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-800 dark:text-green-200",
        borderColor: "border-green-300 dark:border-green-700",
      };
    }
    
    // Parse error message to determine status type
    if (error_message?.includes("PAYMENT NOT CONFIRMED") || error_message?.includes("pending")) {
      return {
        icon: <Clock className="h-8 w-8" />,
        title: "PAYMENT PENDING",
        subtitle: "Payment not yet confirmed",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        textColor: "text-yellow-800 dark:text-yellow-200",
        borderColor: "border-yellow-300 dark:border-yellow-700",
      };
    }
    
    if (error_message?.includes("CANCELLED")) {
      return {
        icon: <XCircle className="h-8 w-8" />,
        title: "BOOKING CANCELLED",
        subtitle: "This booking was cancelled",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        textColor: "text-red-800 dark:text-red-200",
        borderColor: "border-red-300 dark:border-red-700",
      };
    }
    
    if (error_message?.includes("ALREADY USED") || error_message?.includes("ALREADY BOARDED")) {
      return {
        icon: <AlertTriangle className="h-8 w-8" />,
        title: "ALREADY USED",
        subtitle: "This booking has already been used",
        bgColor: "bg-gray-100 dark:bg-gray-800",
        textColor: "text-gray-800 dark:text-gray-200",
        borderColor: "border-gray-300 dark:border-gray-600",
      };
    }
    
    return {
      icon: <XCircle className="h-8 w-8" />,
      title: "INVALID",
      subtitle: error_message || "QR code not recognized",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-800 dark:text-red-200",
      borderColor: "border-red-300 dark:border-red-700",
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scanner Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              id={containerId}
              className="w-full aspect-square rounded-lg overflow-hidden bg-muted"
              style={{ display: isScanning ? "block" : "none" }}
            />

            {!isScanning && (
              <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
                <div className="text-center">
                  <CameraOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Camera is off</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {isScanning ? (
                <Button variant="outline" onClick={stopScanner} className="flex-1">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
              ) : (
                <Button onClick={startScanner} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter QR code data..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
              />
              <Button onClick={handleManualSubmit} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Scan Result</span>
              {lastResult && (
                <Button variant="ghost" size="sm" onClick={resetScanner}>
                  Clear
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : lastResult && statusDisplay ? (
              <div className="space-y-4">
                {/* Status Banner */}
                <div className={`p-4 rounded-lg border-2 ${statusDisplay.bgColor} ${statusDisplay.textColor} ${statusDisplay.borderColor}`}>
                  <div className="flex items-center gap-3">
                    {statusDisplay.icon}
                    <div>
                      <p className="font-bold text-lg">{statusDisplay.title}</p>
                      <p className="text-sm opacity-80">{statusDisplay.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                {lastResult.booking_info && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Guest</p>
                          <p className="font-medium">{lastResult.booking_info.guest_name}</p>
                          {lastResult.booking_info.guest_phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lastResult.booking_info.guest_phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Ship className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Yacht</p>
                          <p className="font-medium">{lastResult.booking_info.yacht_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date & Time</p>
                          <p className="font-medium">
                            {format(new Date(lastResult.booking_info.date), "MMM d, yyyy")}
                          </p>
                          <p className="text-sm">{lastResult.booking_info.time_slot}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Guests</p>
                          <p className="font-medium">{lastResult.booking_info.seats} people</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Booking Reference</span>
                        <span className="font-mono font-bold">
                          {lastResult.booking_info.booking_reference}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Amount</span>
                        <span className="font-bold flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {lastResult.booking_info.total_price} EGP
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className={
                          lastResult.booking_info.status === 'confirmed' 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : lastResult.booking_info.status === 'used' || lastResult.booking_info.status === 'boarded'
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            : lastResult.booking_info.status === 'cancelled'
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }>
                          {lastResult.booking_info.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Button for Valid Bookings */}
                    {lastResult.success && lastResult.booking_info.status === 'confirmed' && (
                      <div className="pt-4">
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700" 
                          size="lg"
                          onClick={handleMarkAsUsed}
                          disabled={isMarkingUsed}
                        >
                          {isMarkingUsed ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                          )}
                          Confirm Boarding
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Scan a QR code to validate a booking
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Only confirmed bookings can board
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRScanner;
