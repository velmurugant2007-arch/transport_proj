"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Fuel, Download, ArrowLeft, Search, Edit } from "lucide-react";
import { bulkImportFuel } from "@/app/(dashboard)/actions/import";
import { ImportZone } from "@/components/ui/import-zone";
import { ExportMenu } from "@/components/ui/export-menu";
import { VehicleSearch } from "@/components/ui/vehicle-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FuelLog, Vehicle } from "@prisma/client";
import { createFuelLog, updateFuelLog, deleteFuelLog } from "@/app/(dashboard)/fuel/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkDeleteToolbar } from "@/components/ui/bulk-delete-toolbar";
import { bulkDeleteFuelLogs } from "@/app/(dashboard)/actions/delete";

type FuelLogWithVehicle = FuelLog & { vehicle: Vehicle };
type VehicleOption = Pick<Vehicle, "id" | "BUS_NUMBER" | "FUEL_TYPE" | "REGISTER_NUMBER">;

// ── List ─────────────────────────────────────────────────────────────────────

export function FuelList({ logs }: { logs: FuelLogWithVehicle[] }) {
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
    const res = await bulkDeleteFuelLogs(selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      alert("Delete failed: " + res.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative page-enter pb-32">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-display-lux text-2xl md:text-3xl">Fuel Records</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Institutional Consumption Registry</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <ExportMenu 
            data={logs.map(log => ({
              ...log,
              RATE: log.LITRES > 0 ? (log.AMOUNT / log.LITRES).toFixed(2) : "0.00"
            }))}
            filename="fuel_logs"
            title="Fuel Consumption Registry"
            headers={[
              "BUS NUMBER", 
              "REGISTER NUMBER", 
              "DATE", 
              "OPENING KM", 
              "CLOSING KM", 
              "RUNNING KM", 
              "MILEAGE", 
              "INDENT NUMBER", 
              "LITRES", 
              "RATE (Price/L)", 
              "AMOUNT"
            ]}
            keys={[
              "vehicle.BUS_NUMBER", 
              "vehicle.REGISTER_NUMBER", 
              "DATE", 
              "OPENING_KM", 
              "CLOSING_KM", 
              "RUNNING_KM", 
              "MILEAGE", 
              "INDENT_NUMBER", 
              "LITRES", 
              "RATE", 
              "AMOUNT"
            ]}
          />
          <ImportZone onImport={bulkImportFuel} label="Import" />
          <Link href="/fuel/new">
            <Button className="btn-yellow-premium h-10 px-6 rounded-14">
              <Plus className="mr-2 h-4.5 w-4.5" strokeWidth={3} /> Add Fuel Log
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
        <div className="min-w-[1000px]">
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
              <TableHead>DATE</TableHead>
              <TableHead>BUS NUMBER</TableHead>
              <TableHead>REGISTER NUMBER</TableHead>
              <TableHead>OPENING KM</TableHead>
              <TableHead>CLOSING KM</TableHead>
              <TableHead>RUNNING KM</TableHead>
              <TableHead>MILEAGE</TableHead>
              <TableHead>INDENT NUMBER</TableHead>
              <TableHead>LITRES</TableHead>
              <TableHead>RATE (Price/L)</TableHead>
              <TableHead>AMOUNT</TableHead>
              <TableHead>ADMIN</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} className="h-40 text-center text-white/20 font-bold uppercase tracking-widest text-xs">
                  {searchTerm ? "No energy records matching search." : "No consumption logs in active ledger."}
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
                  <TableCell className="font-bold text-white/60 whitespace-nowrap">{formatDate(log.DATE)}</TableCell>
                  <TableCell className="font-black text-white">{log.vehicle.BUS_NUMBER}</TableCell>
                  <TableCell className="font-bold text-white/40">{log.vehicle.REGISTER_NUMBER || "-"}</TableCell>
                  <TableCell className="font-bold text-white/60">{log.OPENING_KM}</TableCell>
                  <TableCell className="font-bold text-white/60">{log.CLOSING_KM || "-"}</TableCell>
                  <TableCell className="font-black text-primary">{log.RUNNING_KM || "-"}</TableCell>
                  <TableCell className="font-bold text-white/40">{log.MILEAGE ? `${log.MILEAGE.toFixed(2)}` : "-"}</TableCell>
                  <TableCell className="font-bold text-white/40 uppercase tracking-wider">{log.INDENT_NUMBER || "-"}</TableCell>
                  <TableCell className="font-black text-white">{log.LITRES} L</TableCell>
                  <TableCell className="font-bold text-white/40">₹{(log.AMOUNT / log.LITRES).toFixed(2)}</TableCell>
                  <TableCell className="font-black text-emerald-500">₹{log.AMOUNT.toFixed(2)}</TableCell>
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
                      <Link href={`/fuel/${log.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg">
                          <Plus className="h-4 w-4 rotate-45" />
                        </Button>
                      </Link>
                      <DeleteButton 
                        onDelete={async () => { await deleteFuelLog(log.id); }} 
                        itemName={`Fuel Log for ${log.vehicle.BUS_NUMBER}`}
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

      <BulkDeleteToolbar 
        selectedCount={selectedIds.length}
        totalAvailable={filteredLogs.length}
        onDelete={handleBulkDelete}
        onSelectAll={handleSelectAll}
        onSelectTop10={handleSelectTop10}
        onClear={() => setSelectedIds([])}
      />
    </div>
  );
}

// ── Shared form fields ────────────────────────────────────────────────────────

function FuelFields({ vehicles, defaults }: { vehicles: VehicleOption[]; defaults?: Partial<FuelLog> }) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <div className="space-y-2.5">
          <Label htmlFor="vehicleId" className="text-[11px] font-black uppercase tracking-widest text-white/40">Select Vehicle</Label>
          <VehicleSearch vehicles={vehicles} defaultValue={defaults?.vehicleId} />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="date" className="text-[11px] font-black uppercase tracking-widest text-white/40">Date</Label>
          <Input id="date" name="date" type="date" required className="input-lux h-12"
            defaultValue={defaults?.DATE ? new Date(defaults.DATE).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]} />
        </div>
        <div className="space-y-2.5">
          <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">Fuel Type</Label>
          <Select name="fuelType" defaultValue={defaults?.FUEL_TYPE ?? "DIESEL"} required>
            <SelectTrigger className="input-lux h-12"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent className="bg-[#121418] border-white/10">
              <SelectItem value="DIESEL" className="font-bold">Diesel</SelectItem>
              <SelectItem value="PETROL" className="font-bold">Petrol</SelectItem>
              <SelectItem value="CNG" className="font-bold">CNG</SelectItem>
              <SelectItem value="EV" className="font-bold">Electric (kWh)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="indentNumber" className="text-[11px] font-black uppercase tracking-widest text-white/40">Indent Number</Label>
          <Input id="indentNumber" name="indentNumber" className="input-lux h-12" defaultValue={defaults?.INDENT_NUMBER ?? ""} placeholder="e.g. V-12345" />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="quantity" className="text-[11px] font-black uppercase tracking-widest text-white/40">Litres</Label>
          <Input id="quantity" name="quantity" type="number" step="0.01" className="input-lux h-12" defaultValue={defaults?.LITRES ?? ""} placeholder="e.g. 50.5" required />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="cost" className="text-[11px] font-black uppercase tracking-widest text-white/40">Amount (₹)</Label>
          <Input id="cost" name="cost" type="number" step="0.01" className="input-lux h-12" defaultValue={defaults?.AMOUNT ?? ""} placeholder="e.g. 4500.00" required />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="startOdometer" className="text-[11px] font-black uppercase tracking-widest text-white/40">Opening KM</Label>
          <Input id="startOdometer" name="startOdometer" type="number" step="0.1" className="input-lux h-12" defaultValue={defaults?.OPENING_KM ?? ""} placeholder="e.g. 12500.0" required />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="endOdometer" className="text-[11px] font-black uppercase tracking-widest text-white/40">Closing KM</Label>
          <Input id="endOdometer" name="endOdometer" type="number" step="0.1" className="input-lux h-12" defaultValue={defaults?.CLOSING_KM ?? ""} placeholder="e.g. 12650.5" />
        </div>
      </div>
    </div>
  );
}

// ── Create Form ───────────────────────────────────────────────────────────────

export function FuelForm({ vehicles }: { vehicles: VehicleOption[] }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full page-enter">
      <div className="flex items-center gap-5">
        <Link href="/fuel">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-3xl">Add Fuel Log</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">New Entry</p>
        </div>
      </div>

      <div className="panel-lux p-8 border-white/10">
        <form action={createFuelLog} onSubmit={() => setLoading(true)} className="space-y-10">
          <FuelFields vehicles={vehicles} />
          <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
            <Link href="/fuel">
              <Button variant="ghost" type="button" className="h-12 px-8 rounded-16 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="btn-yellow-premium h-12 px-10 rounded-16 min-w-[200px]">
              {loading ? "Processing..." : "Save Log"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Form ─────────────────────────────────────────────────────────────────

export function FuelEditForm({ log, vehicles }: { log: FuelLog; vehicles: VehicleOption[] }) {
  const [loading, setLoading] = useState(false);
  const action = updateFuelLog.bind(null, log.id);
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full page-enter">
      <div className="flex items-center gap-5">
        <Link href="/fuel">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-3xl">Edit Fuel Log</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Update Log Details</p>
        </div>
      </div>

      <div className="panel-lux p-8 border-white/10">
        <form action={action} onSubmit={() => setLoading(true)} className="space-y-10">
          <FuelFields vehicles={vehicles} defaults={log} />
          <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
            <Link href="/fuel">
              <Button variant="ghost" type="button" className="h-12 px-8 rounded-16 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="btn-yellow-premium h-12 px-10 rounded-16 min-w-[200px]">
              {loading ? "Processing..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
