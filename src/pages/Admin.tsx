import { useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Ship, Calendar, BarChart3, Scan } from "lucide-react";
import YachtManagement from "@/components/admin/YachtManagement";
import BookingsManagement from "@/components/admin/BookingsManagement";
import DashboardStats from "@/components/admin/DashboardStats";
import QRScanner from "@/components/admin/QRScanner";

const Admin = () => {
  const { user, isLoading, isAdmin, isOwner, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Only allow admin, owner, or staff
  if (!user || (!isAdmin && !isOwner && !isStaff)) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your yachts, bookings, and view analytics
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              {(isAdmin || isOwner) && (
                <TabsTrigger value="yachts" className="flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  <span className="hidden sm:inline">Yachts</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Bookings</span>
              </TabsTrigger>
              {(isAdmin || isStaff) && (
                <TabsTrigger value="scanner" className="flex items-center gap-2">
                  <Scan className="h-4 w-4" />
                  <span className="hidden sm:inline">Scanner</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardStats />
            </TabsContent>

            {(isAdmin || isOwner) && (
              <TabsContent value="yachts">
                <YachtManagement />
              </TabsContent>
            )}

            <TabsContent value="bookings">
              <BookingsManagement />
            </TabsContent>

            {(isAdmin || isStaff) && (
              <TabsContent value="scanner">
                <QRScanner />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
