"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Wrench, Download, ArrowLeft, Search, Edit } from "lucide-react";
import { bulkImportMaintenance } from "@/app/(dashboard)/actions/import";
import { ImportZone } from "@/components/ui/import-zone";
import { ExportMenu } from "@/components/ui/export-menu";
import { VehicleSearch } from "@/components/ui/vehicle-search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MaintenanceLog, Vehicle } from "@prisma/client";
import { createMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog } from "@/app/(dashboard)/maintenance/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkDeleteToolbar } from "@/components/ui/bulk-delete-toolbar";
import { bulkDeleteMaintenanceLogs } from "@/app/(dashboard)/actions/delete";

type LogWithVehicle = MaintenanceLog & { vehicle: Pick<Vehicle, "BUS_NUMBER"> };
type VehicleOption = Pick<Vehicle, "id" | "BUS_NUMBER">;

// ── List ─────────────────────────────────────────────────────────────────────

export function MaintenanceList({ logs }: { logs: LogWithVehicle[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredLogs = logs.filter(log => 
    (log.vehicle?.BUS_NUMBER?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredLogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLogs.map(log => log.id));
    }
  };

  const handleSelectTop10 = () => {
    const top10 = filteredLogs.slice(0, 10).map(log => log.id);
    setSelectedIds(top10);
  };

  const handleBulkDelete = async () => {
    const res = await bulkDeleteMaintenanceLogs(selectedIds);
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
            <h1 className="text-display-lux text-2xl md:text-3xl">Maintenance Records</h1>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Vehicle Maintenance Details</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <ExportMenu 
              data={logs}
              filename="maintenance_records"
              title="Fleet Maintenance Inventory"
              headers={["DATE", "BUS", "TYPE", "CENTER", "COST", "NEXT SERVICE DATE", "SPARE PARTS", "BREAKDOWN DETAILS", "NOTES"]}
              keys={["DATE", "vehicle.BUS_NUMBER", "SERVICE_TYPE", "SERVICE_CENTER", "AMOUNT", "NEXT_SERVICE_DATE", "SPARE_PARTS", "BREAKDOWN_DETAILS", "NOTES"]}
            />
            <ImportZone onImport={bulkImportMaintenance} label="Import" />
            <Link href="/maintenance/new">
              <Button className="btn-yellow-premium h-10 px-6 rounded-14">
                <Plus className="mr-2 h-4.5 w-4.5" strokeWidth={3} /> Add Record
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:max-w-sm">
          <div className="relative w-full group">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search vehicle number..."
              className="input-lux pl-11 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="panel-lux">
          <div className="overflow-x-auto">
          <div className="min-w-[900px]">
          <Table>
            <TableHeader className="tbl-head">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedIds.length > 0 && selectedIds.length === filteredLogs.length}
                    onChange={handleSelectAll}
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle Number</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Service Center</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Next Service Date</TableHead>
                <TableHead>ADMIN</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center text-white/20 font-bold uppercase tracking-widest text-xs">
                    {searchTerm ? "No protocol records matching search." : "No technical records in active hub."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className={cn("tbl-row group", selectedIds.includes(log.id) && "bg-primary/5")}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(log.id)}
                        onChange={() => handleSelectRow(log.id)}
                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableCell>
                    <TableCell className="font-bold text-white/60">{formatDate(log.DATE)}</TableCell>
                    <TableCell className="font-black text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                          <Wrench className="h-4 w-4 text-primary" />
                        </div>
                        {log.vehicle.BUS_NUMBER}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.SERVICE_TYPE === "Breakdown" ? "destructive" : "outline"} className={cn(
                        "font-black tracking-widest text-[9px] uppercase px-3 py-1 rounded-full",
                        log.SERVICE_TYPE === "Breakdown" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-white/5 text-white/40 border-white/10"
                      )}>
                        {log.SERVICE_TYPE}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-white/40">{log.SERVICE_CENTER || "Institutional Hub"}</TableCell>
                    <TableCell className="font-black text-primary">₹{log.AMOUNT.toFixed(2)}</TableCell>
                    <TableCell className="font-bold text-white/40 italic">{log.NEXT_SERVICE_DATE ? formatDate(log.NEXT_SERVICE_DATE) : "TBD"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                          <Plus size={8} className="text-primary" />
                          <span>{log.createdBy || "System"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                          <Edit size={8} className="text-primary" />
                          <span>{log.updatedBy || "System"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/maintenance/${log.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg">
                            <Plus className="h-4 w-4 rotate-45" />
                          </Button>
                        </Link>
                        <DeleteButton 
                          onDelete={async () => { await deleteMaintenanceLog(log.id); }} 
                          itemName={`Maintenance Log for ${log.vehicle.BUS_NUMBER}`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
          </div>
        </div>
      </div>

      <BulkDeleteToolbar 
        selectedCount={selectedIds.length}
        totalAvailable={filteredLogs.length}
        onDelete={handleBulkDelete}
        onSelectAll={handleSelectAll}
        onSelectTop10={handleSelectTop10}
        onClear={() => setSelectedIds([])}
      />
    </>
  );
}

// ── Shared form body ──────────────────────────────────────────────────────────

function MaintenanceFields({
  vehicles,
  serviceType,
  setServiceType,
  defaults,
}: {
  vehicles: VehicleOption[];
  serviceType: string;
  setServiceType: (v: string) => void;
  defaults?: Partial<MaintenanceLog>;
}) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <div className="space-y-2.5">
          <Label htmlFor="vehicleId" className="text-[11px] font-black uppercase tracking-widest text-white/40">Select Vehicle</Label>
          <VehicleSearch vehicles={vehicles} defaultValue={defaults?.vehicleId} />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="date" className="text-[11px] font-black uppercase tracking-widest text-white/40">Service Date</Label>
          <Input id="date" name="date" type="date" required className="input-lux h-12"
            defaultValue={defaults?.DATE ? new Date(defaults.DATE).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]} />
        </div>
        <div className="space-y-2.5">
          <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">Service Type</Label>
          <Select name="serviceType" value={serviceType} onValueChange={(v) => v && setServiceType(v)} required>
            <SelectTrigger className="input-lux h-12"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#121418] border-white/10">
              <SelectItem value="Regular" className="font-bold text-white">Regular Service Cycle</SelectItem>
              <SelectItem value="Breakdown" className="font-bold text-rose-400">Emergency Repair</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="cost" className="text-[11px] font-black uppercase tracking-widest text-white/40">Total Cost (₹)</Label>
          <Input id="cost" name="cost" type="number" step="0.01" className="input-lux h-12" defaultValue={defaults?.AMOUNT ?? ""} placeholder="e.g. 500.00" required />
        </div>
      </div>
      
      {serviceType === "Breakdown" && (
        <div className="space-y-4 p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl animate-in zoom-in-95 duration-300">
          <Label htmlFor="breakdownDetails" className="text-[10px] font-black uppercase tracking-widest text-rose-500/60">Incident Analysis</Label>
          <Input id="breakdownDetails" name="breakdownDetails" className="input-lux bg-transparent border-rose-500/20 h-12" defaultValue={defaults?.BREAKDOWN_DETAILS ?? ""} placeholder="Describe operational failure..." />
        </div>
      )}

      <div className="pt-10 border-t border-white/5">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-8">Technical Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <div className="space-y-2.5">
            <Label htmlFor="serviceCenter" className="text-[11px] font-black uppercase tracking-widest text-white/40">Service Center / Mechanic</Label>
            <Input id="serviceCenter" name="serviceCenter" className="input-lux h-12" defaultValue={defaults?.SERVICE_CENTER ?? ""} placeholder="e.g. Metro Auto Works" />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="nextServiceDate" className="text-[11px] font-black uppercase tracking-widest text-white/40">Next Service Date</Label>
            <Input id="nextServiceDate" name="nextServiceDate" type="date" className="input-lux h-12"
              defaultValue={defaults?.NEXT_SERVICE_DATE ? new Date(defaults.NEXT_SERVICE_DATE).toISOString().split("T")[0] : ""} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-2.5">
          <Label htmlFor="spareParts" className="text-[11px] font-black uppercase tracking-widest text-white/40">Spare Parts Used</Label>
          <Input id="spareParts" name="spareParts" className="input-lux h-12" defaultValue={defaults?.SPARE_PARTS ?? ""} placeholder="e.g. Oil filter, Brake pads" />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="notes" className="text-[11px] font-black uppercase tracking-widest text-white/40">Additional Notes</Label>
          <Input id="notes" name="notes" className="input-lux h-12" defaultValue={defaults?.NOTES ?? ""} placeholder="Operations manager notes..." />
        </div>
      </div>
    </div>
  );
}

// ── Create Form ───────────────────────────────────────────────────────────────

export function MaintenanceForm({ vehicles }: { vehicles: VehicleOption[] }) {
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState("Regular");
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full page-enter">
      <div className="flex items-center gap-5">
        <Link href="/maintenance">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-3xl">Add Maintenance Record</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">New Entry</p>
        </div>
      </div>

      <div className="panel-lux p-8 border-white/10">
        <form action={createMaintenanceLog} onSubmit={() => setLoading(true)} className="space-y-10">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
            <p className="text-[11px] font-bold text-primary uppercase tracking-widest text-center">Breakdown records will automatically update vehicle status to "Maintenance".</p>
          </div>
          <MaintenanceFields vehicles={vehicles} serviceType={serviceType} setServiceType={setServiceType} />
          
          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <Link href="/maintenance">
              <Button variant="ghost" type="button" className="h-12 px-8 rounded-16 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="btn-yellow-premium h-12 px-10 rounded-16 min-w-[200px]">
              {loading ? "Processing..." : "Save Record"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Form ─────────────────────────────────────────────────────────────────

export function MaintenanceEditForm({ log, vehicles }: { log: MaintenanceLog; vehicles: VehicleOption[] }) {
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState(log.SERVICE_TYPE);
  const action = updateMaintenanceLog.bind(null, log.id);
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full page-enter">
      <div className="flex items-center gap-5">
        <Link href="/maintenance">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-3xl">Edit Maintenance Record</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Audit Trail Update</p>
        </div>
      </div>

      <div className="panel-lux p-8 border-white/10">
        <form action={action} onSubmit={() => setLoading(true)} className="space-y-10">
          <MaintenanceFields vehicles={vehicles} serviceType={serviceType} setServiceType={setServiceType} defaults={log} />
          
          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <Link href="/maintenance">
              <Button variant="ghost" type="button" className="h-12 px-8 rounded-16 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="btn-yellow-premium h-12 px-10 rounded-16 min-w-[200px]">
              {loading ? "Processing..." : "Save Record"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
