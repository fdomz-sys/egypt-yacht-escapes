import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Ship } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Yacht = Database["public"]["Tables"]["yachts"]["Row"];
type YachtInsert = Database["public"]["Tables"]["yachts"]["Insert"];
type LocationType = Database["public"]["Enums"]["location_type"];
type ActivityType = Database["public"]["Enums"]["activity_type"];

const locationNames: Record<string, string> = {
  "marsa-matruh": "Marsa Matruh",
  "north-coast": "North Coast",
  "alexandria": "Alexandria",
  "el-gouna": "El Gouna",
};

const typeNames: Record<string, string> = {
  "private-yacht": "Private Yacht",
  "shared-trip": "Shared Trip",
  "jet-ski": "Jet Ski",
  "speed-boat": "Speed Boat",
  "catamaran": "Catamaran",
};

const emptyYacht: Partial<YachtInsert> = {
  name: "",
  name_ar: "",
  description: "",
  description_ar: "",
  location: "marsa-matruh",
  type: "private-yacht",
  capacity: 10,
  price_per_person: 100,
  price_per_hour: 500,
  amenities: [],
  included: [],
  image_urls: [],
  is_available: true,
};

const YachtManagement = () => {
  const { user, isAdmin } = useAuth();
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingYacht, setEditingYacht] = useState<Partial<YachtInsert> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchYachts = async () => {
    if (!user) return;

    setIsLoading(true);

    let query = supabase.from("yachts").select("*").order("created_at", { ascending: false });

    // If not admin, only show owned yachts
    if (!isAdmin) {
      query = query.eq("owner_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching yachts:", error);
      toast.error("Failed to load yachts");
    } else {
      setYachts(data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchYachts();
  }, [user, isAdmin]);

  const handleSave = async () => {
    if (!editingYacht || !user) return;

    if (!editingYacht.name || !editingYacht.capacity || !editingYacht.price_per_person || !editingYacht.price_per_hour) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    const yachtData: YachtInsert = {
      name: editingYacht.name,
      name_ar: editingYacht.name_ar || null,
      description: editingYacht.description || null,
      description_ar: editingYacht.description_ar || null,
      location: editingYacht.location as LocationType,
      type: editingYacht.type as ActivityType,
      capacity: editingYacht.capacity,
      price_per_person: editingYacht.price_per_person,
      price_per_hour: editingYacht.price_per_hour,
      amenities: editingYacht.amenities || [],
      included: editingYacht.included || [],
      image_urls: editingYacht.image_urls || [],
      is_available: editingYacht.is_available ?? true,
      owner_id: user.id,
    };

    let error;

    if ((editingYacht as Yacht).id) {
      // Update existing
      const { error: updateError } = await supabase
        .from("yachts")
        .update(yachtData)
        .eq("id", (editingYacht as Yacht).id);
      error = updateError;
    } else {
      // Create new
      const { error: insertError } = await supabase.from("yachts").insert(yachtData);
      error = insertError;
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success((editingYacht as Yacht).id ? "Yacht updated" : "Yacht created");
      fetchYachts();
      setShowDialog(false);
      setEditingYacht(null);
    }

    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("yachts").delete().eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Yacht deleted");
      fetchYachts();
    }

    setDeleteConfirm(null);
  };

  const openCreateDialog = () => {
    setEditingYacht({ ...emptyYacht });
    setShowDialog(true);
  };

  const openEditDialog = (yacht: Yacht) => {
    setEditingYacht({ ...yacht });
    setShowDialog(true);
  };

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Yacht Management</CardTitle>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Yacht
          </Button>
        </CardHeader>
        <CardContent>
          {yachts.length === 0 ? (
            <div className="text-center py-12">
              <Ship className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No yachts yet. Add your first yacht!</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price/Person</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yachts.map((yacht) => (
                    <TableRow key={yacht.id}>
                      <TableCell className="font-medium">{yacht.name}</TableCell>
                      <TableCell>{locationNames[yacht.location] || yacht.location}</TableCell>
                      <TableCell>{typeNames[yacht.type] || yacht.type}</TableCell>
                      <TableCell>{yacht.capacity}</TableCell>
                      <TableCell>EGP {Number(yacht.price_per_person).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={yacht.is_available ? "default" : "secondary"}>
                          {yacht.is_available ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(yacht)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(yacht.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {(editingYacht as Yacht)?.id ? "Edit Yacht" : "Add New Yacht"}
            </DialogTitle>
          </DialogHeader>

          {editingYacht && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (English) *</Label>
                  <Input
                    id="name"
                    value={editingYacht.name || ""}
                    onChange={(e) => setEditingYacht({ ...editingYacht, name: e.target.value })}
                    placeholder="Sea Queen 45ft"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_ar">Name (Arabic)</Label>
                  <Input
                    id="name_ar"
                    value={editingYacht.name_ar || ""}
                    onChange={(e) => setEditingYacht({ ...editingYacht, name_ar: e.target.value })}
                    placeholder="ملكة البحر"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={editingYacht.location || "marsa-matruh"}
                    onValueChange={(val) => setEditingYacht({ ...editingYacht, location: val as LocationType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marsa-matruh">Marsa Matruh</SelectItem>
                      <SelectItem value="north-coast">North Coast</SelectItem>
                      <SelectItem value="alexandria">Alexandria</SelectItem>
                      <SelectItem value="el-gouna">El Gouna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={editingYacht.type || "private-yacht"}
                    onValueChange={(val) => setEditingYacht({ ...editingYacht, type: val as ActivityType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private-yacht">Private Yacht</SelectItem>
                      <SelectItem value="shared-trip">Shared Trip</SelectItem>
                      <SelectItem value="jet-ski">Jet Ski</SelectItem>
                      <SelectItem value="speed-boat">Speed Boat</SelectItem>
                      <SelectItem value="catamaran">Catamaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={editingYacht.capacity || 10}
                    onChange={(e) => setEditingYacht({ ...editingYacht, capacity: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_person">Price/Person (EGP) *</Label>
                  <Input
                    id="price_per_person"
                    type="number"
                    value={editingYacht.price_per_person || 100}
                    onChange={(e) => setEditingYacht({ ...editingYacht, price_per_person: parseInt(e.target.value) || 100 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_hour">Price/Hour (EGP) *</Label>
                  <Input
                    id="price_per_hour"
                    type="number"
                    value={editingYacht.price_per_hour || 500}
                    onChange={(e) => setEditingYacht({ ...editingYacht, price_per_hour: parseInt(e.target.value) || 500 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (English)</Label>
                <Textarea
                  id="description"
                  value={editingYacht.description || ""}
                  onChange={(e) => setEditingYacht({ ...editingYacht, description: e.target.value })}
                  placeholder="Describe your yacht..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ar">Description (Arabic)</Label>
                <Textarea
                  id="description_ar"
                  value={editingYacht.description_ar || ""}
                  onChange={(e) => setEditingYacht({ ...editingYacht, description_ar: e.target.value })}
                  placeholder="وصف اليخت..."
                  rows={3}
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_urls">Image URLs (one per line)</Label>
                <Textarea
                  id="image_urls"
                  value={(editingYacht.image_urls || []).join("\n")}
                  onChange={(e) => setEditingYacht({ ...editingYacht, image_urls: e.target.value.split("\n").filter(Boolean) })}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma separated)</Label>
                <Input
                  id="amenities"
                  value={(editingYacht.amenities || []).join(", ")}
                  onChange={(e) => setEditingYacht({ ...editingYacht, amenities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="WiFi, Sound System, Sun Deck"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="included">What's Included (comma separated)</Label>
                <Input
                  id="included"
                  value={(editingYacht.included || []).join(", ")}
                  onChange={(e) => setEditingYacht({ ...editingYacht, included: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="Captain, Fuel, Soft Drinks"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_available"
                  checked={editingYacht.is_available ?? true}
                  onCheckedChange={(checked) => setEditingYacht({ ...editingYacht, is_available: checked })}
                />
                <Label htmlFor="is_available">Available for booking</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {(editingYacht as Yacht)?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Yacht</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this yacht? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YachtManagement;
