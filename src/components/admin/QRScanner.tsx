import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Camera, CameraOff, CheckCircle2, XCircle, User, Ship, Calendar, Users, Loader2 } from "lucide-react";

interface ScanResult {
  success: boolean;
  error_message: string | null;
  booking_info: {
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
  } | null;
}

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    // Stop scanner to prevent duplicate scans
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
      const result = data?.[0] as ScanResult;
      setLastResult(result);

      if (result?.success) {
        toast.success("Guest checked in successfully!");
      } else {
        toast.error(result?.error_message || "Scan failed");
      }
    }

    setIsProcessing(false);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      toast.error("Please enter a QR code");
      return;
    }
    await processQRCode(manualCode.trim());
    setManualCode("");
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

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
            <CardTitle>Scan Result</CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : lastResult ? (
              <div className="space-y-4">
                {/* Status Banner */}
                <div
                  className={`p-4 rounded-lg flex items-center gap-3 ${
                    lastResult.success
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {lastResult.success ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <XCircle className="h-6 w-6" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {lastResult.success ? "Check-in Successful" : "Check-in Failed"}
                    </p>
                    {lastResult.error_message && (
                      <p className="text-sm">{lastResult.error_message}</p>
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                {lastResult.booking_info && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Guest</p>
                          <p className="font-medium">{lastResult.booking_info.guest_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Yacht</p>
                          <p className="font-medium">{lastResult.booking_info.yacht_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date & Time</p>
                          <p className="font-medium">
                            {format(new Date(lastResult.booking_info.date), "MMM d, yyyy")} at{" "}
                            {lastResult.booking_info.time_slot}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Guests</p>
                          <p className="font-medium">{lastResult.booking_info.seats} people</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Booking Reference</span>
                        <span className="font-mono font-bold">
                          {lastResult.booking_info.booking_reference}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {lastResult.booking_info.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Scan a QR code to check in a guest
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
