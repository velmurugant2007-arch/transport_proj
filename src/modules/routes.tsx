"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { 
  Plus, Search, MapPinned, Clock, Navigation, 
  Users, Bus, ArrowRight, ChevronRight, Edit, 
  Trash2, ArrowLeft, MapPin, Settings2, Info, 
  CheckCircle2, AlertTriangle, Layers, Activity, Filter, Download, PlusCircle
} from "lucide-react";
import { bulkImportRoutes } from "@/app/(dashboard)/actions/import";
import { ImportZone } from "@/components/ui/import-zone";
import { ExportMenu } from "@/components/ui/export-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Route, Stop, Vehicle, Student } from "@prisma/client";
import { createRoute, updateRoute, deleteRoute } from "@/app/(dashboard)/routes/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkDeleteToolbar } from "@/components/ui/bulk-delete-toolbar";
import { bulkDeleteRoutes } from "@/app/(dashboard)/actions/delete";

type RouteWithRelations = Route & {
  stops: (Stop & { _count?: { students: number } })[];
  assignedBuses: { id: string; BUS_NUMBER: string; MAKE?: string | null; MODEL?: string | null; REGISTER_NUMBER?: string | null }[];
  students: { id: string; STUDENT_NAME?: string; REGISTER_NUMBER?: string; boardingPointId?: string | null; assignedBusId?: string | null }[];
  _count?: { students: number; stops: number; assignedBuses: number };
};

// LIST COMPONENT
export function RouteList({ routes }: { routes: RouteWithRelations[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const filteredRoutes = routes.filter(r =>
    r.NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.DESCRIPTION?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeRoute = useMemo(() => 
    routes.find(r => r.id === selectedRouteId),
    [routes, selectedRouteId]
  );

  const handleSelectRow = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Confirm removal of ${selectedIds.length} routes?`)) return;
    const res = await bulkDeleteRoutes(selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      alert("Decommissioning failed: " + res.message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 relative page-enter pb-32">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-display-lux text-2xl md:text-3xl">Route Management</h1>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Manage bus routes and boarding points</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <ExportMenu 
              data={routes.map(r => ({
                ...r,
                stopCount: r.stops.length,
                studentCount: r.students.length,
                busNumbers: r.assignedBuses.map(b => b.BUS_NUMBER).join(", ")
              }))}
              filename="route_inventory"
              title="Transport Route Inventory"
              headers={["NAME", "DISTANCE", "STOPS", "STUDENTS", "BUSES"]}
              keys={["NAME", "DISTANCE", "stopCount", "studentCount", "busNumbers"]}
            />
            <ImportZone onImport={bulkImportRoutes} label="Import" />
            <Link href="/routes/new">
              <Button className="btn-yellow-premium h-10 px-6 rounded-14">
                <Plus className="mr-2 h-4.5 w-4.5" strokeWidth={3} /> Add Route
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
          <div className="relative w-full md:max-w-sm group">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search routes..."
              className="input-lux pl-11 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedIds(selectedIds.length === filteredRoutes.length ? [] : filteredRoutes.map(r => r.id))}
              className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
            >
              {selectedIds.length === filteredRoutes.length ? "Deselect All" : "Select All Routes"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRoutes.length === 0 ? (
              <div className="col-span-full h-60 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-white/10">
                <Navigation size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase tracking-[0.2em] text-sm">No Routes Found</p>
              </div>
            ) : (
              filteredRoutes.map((r) => (
                <RouteCard 
                  key={r.id} 
                  route={r} 
                  isSelected={selectedIds.includes(r.id)}
                  isFocused={selectedRouteId === r.id}
                  onSelect={(e) => handleSelectRow(r.id, e)}
                  onClick={() => setSelectedRouteId(r.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Route Intelligence Detail View */}
        <AnimatePresence>
          {selectedRouteId && activeRoute && (
            <RouteDetailView 
              route={activeRoute} 
              onClose={() => setSelectedRouteId(null)} 
            />
          )}
        </AnimatePresence>
      </div>

      <BulkDeleteToolbar 
        selectedCount={selectedIds.length}
        totalAvailable={filteredRoutes.length}
        onDelete={handleBulkDelete}
        onSelectAll={() => setSelectedIds(filteredRoutes.map(r => r.id))}
        onSelectTop10={() => setSelectedIds(filteredRoutes.slice(0, 10).map(r => r.id))}
        onClear={() => setSelectedIds([])}
      />
    </>
  );
}

// CARD COMPONENT
function RouteCard({ 
  route, isSelected, isFocused, onSelect, onClick 
}: { 
  route: RouteWithRelations;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onClick: () => void;
}) {
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
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
              isSelected ? "bg-primary text-black" : "bg-white/5 text-primary group-hover:bg-primary/20"
            )}>
              <Navigation size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white group-hover:text-primary transition-colors">
                {route.NAME}
              </h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                {route.stops.length} Boarding Points
              </p>
            </div>
          </div>
          <Checkbox checked={isSelected} onChange={(e) => onSelect(e as any)} className="border-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
            <p className="text-[8px] font-black uppercase text-white/20 mb-1">Student Count</p>
            <div className="flex items-center gap-2">
              <Users size={12} className="text-primary" />
              <span className="text-xs font-black text-white">{route.students.length}</span>
            </div>
          </div>
          <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
            <p className="text-[8px] font-black uppercase text-white/20 mb-1">Assigned Buses</p>
            <div className="flex items-center gap-2">
              <Bus size={12} className="text-primary" />
              <span className="text-xs font-black text-white">{route.assignedBuses.length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/40">
            <MapPinned size={10} />
            <span>{route.DISTANCE} KM Network</span>
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}

// DETAIL VIEW (SLIDE-IN)
function RouteDetailView({ route, onClose }: { route: RouteWithRelations; onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-y-0 right-0 w-full lg:w-[55vw] bg-[#090a0c] border-l border-white/10 z-[100] shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <Button variant="ghost" onClick={onClose} className="h-9 md:h-10 rounded-full hover:bg-white/5 text-white/40 text-xs md:text-sm">
              <ArrowLeft className="mr-1.5 md:mr-2 h-4 w-4" /> Close Details
            </Button>
            <div className="flex gap-2 md:gap-3">
              <Link href={`/routes/${route.id}/edit`}>
                <Button className="btn-yellow-premium h-9 md:h-10 rounded-12 text-xs md:text-sm"><Edit className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" /> Edit Route</Button>
              </Link>
              <DeleteButton onDelete={async () => { await deleteRoute(route.id); onClose(); }} itemName={`Route ${route.NAME}`} />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl md:rounded-3xl bg-primary flex items-center justify-center text-black shadow-[0_0_30px_rgba(244,180,0,0.2)]">
              <MapPinned className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black text-white tracking-tight">{route.NAME}</h2>
              <p className="text-[10px] md:text-sm font-bold text-white/40 uppercase tracking-widest mt-0.5 md:mt-1">{route.DESCRIPTION || "NO NETWORK DESCRIPTION"}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 md:space-y-12">
          {/* Fleet & Personnel Sync */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                <Bus size={14} className="text-primary" /> Assigned Buses
              </h4>
              <div className="space-y-3">
                {route.assignedBuses.map(bus => (
                  <Link key={bus.id} href={`/vehicles?id=${bus.id}`}>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-xs">{bus.BUS_NUMBER}</div>
                        <div>
                          <p className="text-sm font-black text-white">
                            {(!bus.MAKE && !bus.MODEL) ? "Institutional Fleet" : `${bus.MAKE || ""} ${bus.MODEL || ""}`.trim()}
                          </p>
                          <p className="text-[10px] font-bold text-white/30 uppercase">{bus.REGISTER_NUMBER}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[9px]">ACTIVE</Badge>
                    </div>
                  </Link>
                ))}
                {route.assignedBuses.length === 0 && (
                  <div className="p-6 border border-dashed border-white/10 rounded-2xl text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">No Assets Allocated</p>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                <Activity size={14} className="text-primary" /> Route Details
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Total Students</p>
                  <p className="text-xl font-black text-white">{route.students.length} Students</p>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Route Distance</p>
                  <p className="text-xl font-black text-white">{route.DISTANCE || "0"} KM</p>
                </div>
              </div>
            </section>
          </div>

          {/* Boarding Infrastructure */}
          <section className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
              <Layers size={14} className="text-primary" /> Boarding Points
            </h4>
            <div className="panel-lux overflow-hidden border-white/10">
              <Table>
                <TableHeader className="tbl-head">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16">Seq</TableHead>
                    <TableHead>Boarding Point</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Fee Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {route.stops.sort((a,b) => a.ORDER - b.ORDER).map((stop) => {
                    const stopStudents = route.students.filter(s => s.boardingPointId === stop.id);
                    return (
                      <TableRow key={stop.id} className="tbl-row group/row">
                        <TableCell className="font-black text-primary/40">{stop.ORDER}</TableCell>
                        <TableCell>
                          <div className="font-black text-white">{stop.NAME}</div>
                          <div className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">ID: {stop.id.slice(-6)}</div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/students?routeId=${route.id}&boardingPointId=${stop.id}`}>
                            <Badge className={cn(
                              "font-black px-2.5 py-1 rounded-lg cursor-pointer hover:scale-105 transition-transform",
                              stopStudents.length > 0 ? "bg-primary text-black" : "bg-white/5 text-white/20 border-white/10"
                            )}>
                              {stopStudents.length} Students
                            </Badge>
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-black text-emerald-500">₹{stop.AMOUNT || "0"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Audit Section */}
          <section className="space-y-4 pt-6 border-t border-white/5">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
              <Settings2 size={14} className="text-primary" /> Administrative Audit
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">Created By</p>
                <div className="flex items-center gap-2 text-white">
                  <Plus size={10} className="text-primary" />
                  <p className="text-xs font-bold">{route.createdBy || "System"}</p>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-white/20 uppercase mb-1">Last Sync</p>
                <div className="flex items-center gap-2 text-white">
                  <Edit size={10} className="text-primary" />
                  <p className="text-xs font-bold">{route.updatedBy || "System"}</p>
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
export function RouteForm() {
  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState<{ NAME: string; ORDER: number; AMOUNT: number }[]>([
    { NAME: "", ORDER: 1, AMOUNT: 0 }
  ]);

  const addStop = () => setStops([...stops, { NAME: "", ORDER: stops.length + 1, AMOUNT: 0 }]);
  const removeStop = (idx: number) => setStops(stops.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full page-enter">
      <div className="flex items-center gap-5">
        <Link href="/routes">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-3xl">Route Management</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Manage bus routes and boarding points</p>
        </div>
      </div>

      <div className="panel-lux p-8 border-white/10">
        <form action={createRoute} onSubmit={() => setLoading(true)} className="space-y-12">
          {/* Core Route Info */}
          <section className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
              <Navigation size={18} /> Route Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-white/40">Route Name</Label>
                <Input id="name" name="name" placeholder="e.g. Dindigul Central Express" className="input-lux h-12" required />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-[11px] font-black uppercase tracking-widest text-white/40">Route Description</Label>
                <Input id="description" name="description" placeholder="e.g. Covering Main Road & Bus Stand" className="input-lux h-12" />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="distance" className="text-[11px] font-black uppercase tracking-widest text-white/40">Total Distance (KM)</Label>
                <Input id="distance" name="distance" type="number" step="0.1" placeholder="e.g. 25.5" className="input-lux h-12" />
              </div>
            </div>
          </section>

          {/* Stop Infrastructure */}
          <section className="space-y-8 pt-10 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                <Layers size={18} /> Boarding Points
              </h3>
              <Button type="button" onClick={addStop} variant="outline" className="h-10 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Boarding Point
              </Button>
            </div>
            
            <div className="space-y-4">
              {stops.map((stop, i) => (
                <div key={i} className="group flex flex-wrap md:flex-nowrap items-end gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl transition-all hover:bg-white/[0.04] hover:border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-white/20 border border-white/5 group-hover:text-primary transition-colors">{i+1}</div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Boarding Point Name</Label>
                    <Input name={`stop_name_${i}`} placeholder="Point Name" className="input-lux h-11" required />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Fee (₹)</Label>
                    <Input name={`stop_amount_${i}`} type="number" placeholder="0" className="input-lux h-11 font-black text-emerald-500" />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Lat (opt)</Label>
                    <Input name={`stop_lat_${i}`} type="number" step="any" placeholder="e.g. 10.3684" className="input-lux h-11 font-bold text-white/60" />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Lng (opt)</Label>
                    <Input name={`stop_lng_${i}`} type="number" step="any" placeholder="e.g. 77.9855" className="input-lux h-11 font-bold text-white/60" />
                  </div>
                  <Button type="button" onClick={() => removeStop(i)} variant="ghost" className="h-11 w-11 p-0 rounded-xl text-white/10 hover:text-red-500 hover:bg-red-500/10">
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
            </div>
            <input type="hidden" name="stops_count" value={stops.length} />
          </section>

          <div className="flex justify-end gap-4 pt-10 border-t border-white/5">
            <Link href="/routes">
              <Button variant="ghost" type="button" className="h-12 px-8 rounded-16 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancel Design</Button>
            </Link>
            <Button type="submit" disabled={loading} className="btn-yellow-premium h-12 px-10 rounded-16 min-w-[200px]">
              {loading ? "Adding..." : "Add Route"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// EDIT FORM COMPONENT
export function RouteEditForm({ route }: { route: Route & { stops: Stop[] } }) {
  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState(route.stops.sort((a,b) => a.ORDER - b.ORDER));
  const action = updateRoute.bind(null, route.id);

  const addStop = () => setStops([...stops, { id: `new_${Date.now()}`, NAME: "", ORDER: stops.length + 1, AMOUNT: 0, routeId: route.id, DISTANCE: 0 } as any]);
  const removeStop = (idx: number) => setStops(stops.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full page-enter">
      <div className="flex items-center gap-5">
        <Link href="/routes">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-3xl">Edit Route</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Manage bus routes and boarding points: {route.NAME}</p>
        </div>
      </div>

      <div className="panel-lux p-8 border-white/10">
        <form action={action} onSubmit={() => setLoading(true)} className="space-y-12">
          {/* Core Route Info */}
          <section className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
              <Navigation size={18} /> Primary Network Specification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-white/40">Route Name</Label>
                <Input id="name" name="name" defaultValue={route.NAME} className="input-lux h-12" required />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-[11px] font-black uppercase tracking-widest text-white/40">Description</Label>
                <Input id="description" name="description" defaultValue={route.DESCRIPTION || ""} className="input-lux h-12" />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="distance" className="text-[11px] font-black uppercase tracking-widest text-white/40">Distance (KM)</Label>
                <Input id="distance" name="distance" type="number" step="0.1" defaultValue={route.DISTANCE || 0} className="input-lux h-12" />
              </div>
            </div>
          </section>

          {/* Stop Infrastructure */}
          <section className="space-y-8 pt-10 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                <Layers size={18} /> Node Infrastructure Sync
              </h3>
              <Button type="button" onClick={addStop} variant="outline" className="h-10 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                <PlusCircle className="mr-2 h-4 w-4" /> Expand Network
              </Button>
            </div>
            
            <div className="space-y-4">
              {stops.map((stop, i) => (
                <div key={stop.id} className="group flex flex-wrap md:flex-nowrap items-end gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl transition-all hover:bg-white/[0.04] hover:border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-white/20 border border-white/5 group-hover:text-primary transition-colors">{i+1}</div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Station Name</Label>
                    <Input name={`stop_name_${i}`} defaultValue={stop.NAME} className="input-lux h-11" required />
                    <input type="hidden" name={`stop_id_${i}`} value={stop.id.startsWith("new_") ? "" : stop.id} />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Fee (₹)</Label>
                    <Input name={`stop_amount_${i}`} type="number" defaultValue={stop.AMOUNT || 0} className="input-lux h-11 font-black text-emerald-500" />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Lat (opt)</Label>
                    <Input name={`stop_lat_${i}`} type="number" step="any" defaultValue={stop.LATITUDE || ""} placeholder="e.g. 10.3684" className="input-lux h-11 font-bold text-white/60" />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="text-[9px] font-black text-white/20 uppercase tracking-widest">Lng (opt)</Label>
                    <Input name={`stop_lng_${i}`} type="number" step="any" defaultValue={stop.LONGITUDE || ""} placeholder="e.g. 77.9855" className="input-lux h-11 font-bold text-white/60" />
                  </div>
                  <Button type="button" onClick={() => removeStop(i)} variant="ghost" className="h-11 w-11 p-0 rounded-xl text-white/10 hover:text-red-500 hover:bg-red-500/10">
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
            </div>
            <input type="hidden" name="stops_count" value={stops.length} />
          </section>

          <div className="flex justify-end gap-4 pt-10 border-t border-white/5">
            <Link href="/routes">
              <Button variant="ghost" type="button" className="h-12 px-8 rounded-16 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">Abort Changes</Button>
            </Link>
            <Button type="submit" disabled={loading} className="btn-yellow-premium h-12 px-10 rounded-16 min-w-[200px]">
              {loading ? "Synchronizing..." : "Sync Network Design"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
