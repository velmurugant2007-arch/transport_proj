"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { 
  Plus, Download, Search, Bus, MapPin, Fuel, 
  Users, User, Phone, Edit, Trash2, ArrowRight, 
  ChevronRight, ArrowLeft, ShieldCheck, Settings2,
  AlertTriangle, Activity, MapPinned, X, Info
} from "lucide-react";
import { bulkImportVehicles } from "@/app/(dashboard)/actions/import";
import { ImportZone } from "@/components/ui/import-zone";
import { Button } from "@/components/ui/button";
import { ExportMenu } from "@/components/ui/export-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehicle, Route, Stop } from "@prisma/client";
import { createVehicle, updateVehicle, deleteVehicle } from "@/app/(dashboard)/vehicles/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkDeleteToolbar } from "@/components/ui/bulk-delete-toolbar";
import { bulkDeleteVehicles } from "@/app/(dashboard)/actions/delete";

type VehicleWithRelations = Vehicle & {
  _count: { students: number };
  routes: (Route & { stops: Stop[] })[];
};

// LIST COMPONENT
export function VehicleList({ vehicles }: { vehicles: VehicleWithRelations[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const filteredVehicles = vehicles.filter(v =>
    v.BUS_NUMBER.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.REGISTER_NUMBER?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeVehicle = useMemo(() => 
    vehicles.find(v => v.id === selectedVehicleId),
    [vehicles, selectedVehicleId]
  );

  const handleSelectRow = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} vehicles?`)) return;
    const res = await bulkDeleteVehicles(selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      alert("Delete failed: " + res.message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 relative page-enter pb-32">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-display-lux text-2xl md:text-3xl">Bus Management</h1>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Vehicle Management</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <ExportMenu 
              data={vehicles}
              filename="fleet_inventory"
              title="Vehicle Fleet Inventory"
              headers={["BUS NO", "REG NO", "MAKE", "MODEL", "CAPACITY", "FUEL", "STATUS", "DRIVER", "PHONE"]}
              keys={["BUS_NUMBER", "REGISTER_NUMBER", "MAKE", "MODEL", "CAPACITY", "FUEL_TYPE", "STATUS", "DRIVER_NAME", "DRIVER_PHONE"]}
            />
            <ImportZone onImport={bulkImportVehicles} label="Import" />
            <Link href="/vehicles/new">
              <Button className="btn-yellow-premium h-10 px-4 md:px-6 rounded-14 text-xs md:text-sm">
                <Plus className="mr-1.5 md:mr-2 h-4 w-4 md:h-4.5 md:w-4.5" strokeWidth={3} /> Add Vehicle
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
          <div className="relative w-full md:max-w-sm group">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by bus number or registration..."
              className="input-lux pl-11 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedIds(selectedIds.length === filteredVehicles.length ? [] : filteredVehicles.map(v => v.id))}
              className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
            >
              {selectedIds.length === filteredVehicles.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredVehicles.length === 0 ? (
              <div className="col-span-full h-60 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-white/10">
                <Bus size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase tracking-[0.2em] text-sm">No Vehicles Found</p>
              </div>
            ) : (
              filteredVehicles.map((v) => (
                <VehicleCard 
                  key={v.id} 
                  vehicle={v} 
                  isSelected={selectedIds.includes(v.id)}
                  isFocused={selectedVehicleId === v.id}
                  onSelect={(e) => handleSelectRow(v.id, e)}
                  onClick={() => setSelectedVehicleId(v.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Landscape Transition Detail View */}
        <AnimatePresence>
          {selectedVehicleId && activeVehicle && (
            <VehicleDetailView 
              vehicle={activeVehicle} 
              onClose={() => setSelectedVehicleId(null)} 
            />
          )}
        </AnimatePresence>
      </div>

      <BulkDeleteToolbar 
        selectedCount={selectedIds.length}
        totalAvailable={filteredVehicles.length}
        onDelete={handleBulkDelete}
        onSelectAll={() => setSelectedIds(filteredVehicles.map(v => v.id))}
        onSelectTop10={() => setSelectedIds(filteredVehicles.slice(0, 10).map(v => v.id))}
        onClear={() => setSelectedIds([])}
      />
    </>
  );
}

// CARD COMPONENT
function VehicleCard({ 
  vehicle, isSelected, isFocused, onSelect, onClick 
}: { 
  vehicle: VehicleWithRelations;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const occupancyRate = vehicle.CAPACITY > 0 ? (vehicle._count.students / vehicle.CAPACITY) * 100 : 0;
  const isAllocated = vehicle.CAPACITY > 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative flex flex-col rounded-3xl border transition-all duration-500 overflow-hidden cursor-pointer",
        isSelected ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(255,200,0,0.1)]" : "border-primary bg-white/[0.03] hover:bg-white/[0.05]",
        isFocused ? "ring-2 ring-primary border-transparent" : ""
      )}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={cn(
              "min-w-[48px] h-12 px-3 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-all duration-500",
              isSelected ? "bg-primary text-black" : "bg-white/5 text-primary group-hover:bg-primary/20"
            )}>
              <span className="text-[9px] font-black uppercase opacity-60">Bus</span>
              <span className="text-sm font-black -mt-1 whitespace-nowrap">{vehicle.BUS_NUMBER}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black tracking-tight text-white group-hover:text-primary transition-colors truncate whitespace-nowrap" title={vehicle.REGISTER_NUMBER || ""}>
                {vehicle.REGISTER_NUMBER || "NO OFFICIAL PLATE"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-[8px] font-black uppercase tracking-widest border px-2 py-0.5 bg-white/5 text-white/40 border-white/10 shrink-0">
                  {vehicle.FUEL_TYPE}
                </Badge>
              </div>
            </div>
          </div>
          <Checkbox checked={isSelected} onChange={(e) => onSelect(e as any)} className="border-white/10" />
        </div>

        <div className="space-y-4">
          <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/20 mb-2">
              <span>Assigned Route</span>
              <MapPinned size={10} />
            </div>
            <p className="text-xs font-bold text-white truncate">{vehicle.routes[0]?.NAME || "Route Not Assigned"}</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={12} className="text-white/20" />
                <span className="text-xs font-black text-white">{vehicle._count.students}</span>
                <span className="text-[10px] font-bold text-white/20">/ {isAllocated ? vehicle.CAPACITY : "NA"}</span>
              </div>
              <span className="text-[10px] font-black text-primary">CAPACITY: {vehicle.CAPACITY}</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(occupancyRate, 100)}%` }}
                className={cn("h-full", occupancyRate > 90 ? "bg-red-500" : "bg-primary")}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <ChevronRight size={16} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}

// DETAIL VIEW (SLIDE-IN)
function VehicleDetailView({ vehicle, onClose }: { vehicle: VehicleWithRelations; onClose: () => void }) {
  const route = vehicle.routes[0];
  const occupancyRate = vehicle.CAPACITY > 0 ? (vehicle._count.students / vehicle.CAPACITY) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-y-0 right-0 w-full lg:w-[50vw] bg-[#090a0c] border-l border-white/10 z-[100] shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <Button variant="ghost" onClick={onClose} className="h-9 md:h-10 rounded-full hover:bg-white/5 text-white/40 text-xs md:text-sm">
              <ArrowLeft className="mr-1.5 md:mr-2 h-4 w-4" /> Close Operations
            </Button>
            <div className="flex gap-2 md:gap-3">
              <Link href={`/vehicles/${vehicle.id}/edit`}>
                <Button className="btn-yellow-premium h-9 md:h-10 rounded-12 text-xs"><Edit className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" /> Edit Vehicle</Button>
              </Link>
              <DeleteButton onDelete={async () => { await deleteVehicle(vehicle.id); onClose(); }} itemName={`Bus ${vehicle.BUS_NUMBER}`} />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="min-w-[60px] md:min-w-[80px] h-16 md:h-20 px-3 md:px-4 rounded-2xl md:rounded-3xl bg-primary flex flex-col items-center justify-center text-black shadow-[0_0_30px_rgba(244,180,0,0.2)] shrink-0">
              <span className="text-[9px] md:text-xs font-black uppercase opacity-60">Bus</span>
              <span className="text-xl md:text-2xl font-black -mt-1 whitespace-nowrap">{vehicle.BUS_NUMBER}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg md:text-3xl font-black text-white tracking-tight truncate" title={vehicle.REGISTER_NUMBER || ""}>
                  {vehicle.REGISTER_NUMBER || "NO OFFICIAL PLATE"}
                </h2>
              </div>
              <p className="text-[10px] md:text-sm font-bold text-white/40 uppercase tracking-widest">Official Registration ID</p>
            </div>
          </div>
        </div>

        {/* Analytics Strip */}
        <div className="grid grid-cols-3 border-b border-white/5">
          <div className="p-3 md:p-6 border-r border-white/5 flex flex-col items-center text-center">
            <Users size={16} className="text-primary mb-1.5 md:mb-2 opacity-50" />
            <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5 md:mb-1">Seat Occupancy</p>
            <p className="text-sm md:text-xl font-black text-white">{vehicle._count.students} / {vehicle.CAPACITY}</p>
          </div>
          <div className="p-3 md:p-6 border-r border-white/5 flex flex-col items-center text-center">
            <Fuel size={16} className="text-primary mb-1.5 md:mb-2 opacity-50" />
            <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5 md:mb-1">Fuel Type</p>
            <p className="text-xs md:text-xl font-black text-white truncate max-w-full px-1">{vehicle.FUEL_TYPE}</p>
          </div>
          <div className="p-3 md:p-6 flex flex-col items-center text-center">
            <Settings2 size={16} className="text-primary mb-1.5 md:mb-2 opacity-50" />
            <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5 md:mb-1">Model</p>
            <p className="text-xs md:text-xl font-black text-white truncate max-w-full px-1">
              {(!vehicle.MAKE && !vehicle.MODEL) ? "Standard" : `${vehicle.MAKE || ""} ${vehicle.MODEL || ""}`.trim()}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 md:space-y-10">
          {/* Operational Sector */}
          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
              <MapPinned size={14} className="text-primary" /> Assigned Route
            </h4>
            {route ? (
              <Link href={`/routes?id=${route.id}`}>
                <div className="group bg-white/5 hover:bg-white/10 p-6 rounded-3xl border border-white/5 transition-all cursor-pointer flex items-center justify-between">
                  <div>
                    <p className="text-lg font-black text-white">{route.NAME}</p>
                    <p className="text-xs font-bold text-white/30 mt-1">{vehicle._count.students} Students Enrolled</p>
                  </div>
                  <ArrowRight size={20} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ) : (
              <div className="p-10 border border-dashed border-white/5 rounded-3xl text-center opacity-40">
                <p className="text-xs font-black uppercase tracking-widest">Route Not Assigned</p>
              </div>
            )}
          </section>

          {/* Personnel */}
          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
              <User size={14} className="text-primary" /> Driver Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Driver Name</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><User size={20} /></div>
                  <p className="text-sm font-black text-white">{vehicle.DRIVER_NAME || "Institutional Standard"}</p>
                </div>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Emergency Contact</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40"><Phone size={20} /></div>
                  <p className="text-sm font-black text-white">{vehicle.DRIVER_PHONE || "No Verified Phone"}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Identity */}
          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
              <Settings2 size={14} className="text-primary" /> Vehicle Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">Manufacturer</p>
                <p className="text-xs font-bold text-white">{vehicle.MAKE || "Institutional"}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">Model Name</p>
                <p className="text-xs font-bold text-white">{vehicle.MODEL || "Fleet Vehicle"}</p>
              </div>
            </div>
          </section>

          {/* Audit Section */}
          <section className="space-y-4 pt-6 border-t border-white/5">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" /> Administrative Audit
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">Created By</p>
                <div className="flex items-center gap-2 text-white">
                  <Plus size={10} className="text-primary" />
                  <p className="text-xs font-bold">{vehicle.createdBy || "System"}</p>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">Last Update</p>
                <div className="flex items-center gap-2 text-white">
                  <Edit size={10} className="text-primary" />
                  <p className="text-xs font-bold">{vehicle.updatedBy || "System"}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

// FORM COMPONENT
export function VehicleForm() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto w-full page-enter">
      <div className="flex items-center gap-3 md:gap-5">
        <Link href="/vehicles">
          <Button variant="outline" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-xl md:text-3xl">Add New Vehicle</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-0.5">Vehicle Registration</p>
        </div>
      </div>

      <div className="panel-lux p-4 md:p-8 border-white/10">
        <form action={createVehicle} onSubmit={() => setLoading(true)} className="space-y-8 md:space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-10 gap-y-5 md:gap-y-8">
            <div className="space-y-2.5">
              <Label htmlFor="number" className="text-[11px] font-black uppercase tracking-widest text-white/40">Bus Number (Identifier)</Label>
              <Input id="number" name="number" placeholder="e.g. 1" className="input-lux h-12" required />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="registrationNumber" className="text-[11px] font-black uppercase tracking-widest text-white/40">Official Registration Number</Label>
              <Input id="registrationNumber" name="registrationNumber" placeholder="e.g. TN 01 AA 1111" className="input-lux h-12" required />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="fuelType" className="text-[11px] font-black uppercase tracking-widest text-white/40">Fuel Type</Label>
              <Select name="fuelType" required defaultValue="DIESEL">
                <SelectTrigger className="input-lux h-12"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent className="bg-[#121418] border-white/10">
                  <SelectItem value="DIESEL" className="font-bold">DIESEL (Institutional)</SelectItem>
                  <SelectItem value="CNG" className="font-bold">CNG (Eco-Class)</SelectItem>
                  <SelectItem value="NOT_ALLOCATED" className="font-bold opacity-50">NOT ALLOCATED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="status" className="text-[11px] font-black uppercase tracking-widest text-white/40">Operational Status</Label>
              <Select name="status" defaultValue="ACTIVE">
                <SelectTrigger className="input-lux h-12"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#121418] border-white/10">
                  <SelectItem value="ACTIVE" className="font-bold text-green-500">ACTIVE</SelectItem>
                  <SelectItem value="MAINTENANCE" className="font-bold text-amber-500">MAINTENANCE</SelectItem>
                  <SelectItem value="BROKEN DOWN" className="font-bold text-red-500">BROKEN DOWN</SelectItem>
                  <SelectItem value="INACTIVE" className="font-bold opacity-50">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="make" className="text-[11px] font-black uppercase tracking-widest text-white/40">Vehicle Model (Make)</Label>
              <Input id="make" name="make" placeholder="e.g. Tata Motors" className="input-lux h-12" />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="model" className="text-[11px] font-black uppercase tracking-widest text-white/40">Model Variant</Label>
              <Input id="model" name="model" placeholder="e.g. Starbus" className="input-lux h-12" />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="capacity" className="text-[11px] font-black uppercase tracking-widest text-white/40">Seating Capacity</Label>
              <Input id="capacity" name="capacity" type="number" placeholder="e.g. 40" className="input-lux h-12" required />
            </div>
          </div>

          <div className="pt-6 md:pt-10 border-t border-white/5">
            <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-primary mb-5 md:mb-8">Driver Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-10 gap-y-5 md:gap-y-8">
              <div className="space-y-2.5">
                <Label htmlFor="driverName" className="text-[11px] font-black uppercase tracking-widest text-white/40">Driver Name</Label>
                <Input id="driverName" name="driverName" placeholder="Staff Name" className="input-lux h-12" />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="driverPhone" className="text-[11px] font-black uppercase tracking-widest text-white/40">Contact Verification</Label>
                <Input id="driverPhone" name="driverPhone" placeholder="Verification ID / Phone" className="input-lux h-12" />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3 md:gap-4 pt-6">
            <Link href="/vehicles">
              <Button variant="ghost" type="button" className="w-full md:w-auto h-12 px-8 rounded-16 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="btn-yellow-premium h-12 px-10 rounded-16 w-full md:w-auto md:min-w-[200px]">
              {loading ? "Processing..." : "Add Vehicle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// EDIT FORM COMPONENT
export function VehicleEditForm({ vehicle }: { vehicle: Vehicle }) {
  const [loading, setLoading] = useState(false);
  const action = updateVehicle.bind(null, vehicle.id);
  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto w-full page-enter">
      <div className="flex items-center gap-3 md:gap-5">
        <Link href="/vehicles">
          <Button variant="outline" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-xl md:text-3xl">Edit Vehicle</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-0.5">Update Details: Bus {vehicle.BUS_NUMBER}</p>
        </div>
      </div>

      <div className="panel-lux p-4 md:p-8 border-white/10">
        <form action={action} onSubmit={() => setLoading(true)} className="space-y-8 md:space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-10 gap-y-5 md:gap-y-8">
            <div className="space-y-2.5">
              <Label htmlFor="number" className="text-[11px] font-black uppercase tracking-widest text-white/40">Bus Number</Label>
              <Input id="number" name="number" defaultValue={vehicle.BUS_NUMBER} className="input-lux h-12" required />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="registrationNumber" className="text-[11px] font-black uppercase tracking-widest text-white/40">Official Registration ID</Label>
              <Input id="registrationNumber" name="registrationNumber" defaultValue={vehicle.REGISTER_NUMBER || ""} className="input-lux h-12" required />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="fuelType" className="text-[11px] font-black uppercase tracking-widest text-white/40">Energy Class</Label>
              <Select name="fuelType" defaultValue={vehicle.FUEL_TYPE}>
                <SelectTrigger className="input-lux h-12"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#121418] border-white/10">
                  <SelectItem value="DIESEL" className="font-bold">DIESEL (Institutional)</SelectItem>
                  <SelectItem value="CNG" className="font-bold">CNG (Eco-Class)</SelectItem>
                  <SelectItem value="NOT_ALLOCATED" className="font-bold opacity-50">NOT ALLOCATED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="status" className="text-[11px] font-black uppercase tracking-widest text-white/40">Operational Status</Label>
              <Select name="status" defaultValue={vehicle.STATUS}>
                <SelectTrigger className="input-lux h-12"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#121418] border-white/10">
                  <SelectItem value="ACTIVE" className="font-bold text-green-500">ACTIVE</SelectItem>
                  <SelectItem value="MAINTENANCE" className="font-bold text-amber-500">MAINTENANCE</SelectItem>
                  <SelectItem value="BROKEN DOWN" className="font-bold text-red-500">BROKEN DOWN</SelectItem>
                  <SelectItem value="INACTIVE" className="font-bold opacity-50">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="make" className="text-[11px] font-black uppercase tracking-widest text-white/40">Manufacturer</Label>
              <Input id="make" name="make" defaultValue={vehicle.MAKE || ""} className="input-lux h-12" />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="model" className="text-[11px] font-black uppercase tracking-widest text-white/40">Model Variant</Label>
              <Input id="model" name="model" defaultValue={vehicle.MODEL || ""} className="input-lux h-12" />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="capacity" className="text-[11px] font-black uppercase tracking-widest text-white/40">Seating Capacity</Label>
              <Input id="capacity" name="capacity" type="number" defaultValue={vehicle.CAPACITY} className="input-lux h-12" required />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="driverName" className="text-[11px] font-black uppercase tracking-widest text-white/40">Primary Officer</Label>
              <Input id="driverName" name="driverName" defaultValue={vehicle.DRIVER_NAME || ""} className="input-lux h-11" />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="driverPhone" className="text-[11px] font-black uppercase tracking-widest text-white/40">Contact Verification</Label>
              <Input id="driverPhone" name="driverPhone" defaultValue={vehicle.DRIVER_PHONE || ""} className="input-lux h-11" />
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3 md:gap-4 pt-6 border-t border-white/5">
            <Link href="/vehicles">
              <Button variant="ghost" type="button" className="w-full md:w-auto h-12 px-8 rounded-16 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="btn-yellow-premium h-12 px-10 rounded-16 w-full md:w-auto md:min-w-[200px]">
              {loading ? "Processing..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
