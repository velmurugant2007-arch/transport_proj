"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Banknote, Download, ArrowLeft, Search, Edit } from "lucide-react";
import { bulkImportExpenses } from "@/app/(dashboard)/actions/import";
import { ImportZone } from "@/components/ui/import-zone";
import { ExportMenu } from "@/components/ui/export-menu";
import { VehicleSearch } from "@/components/ui/vehicle-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Expense, Vehicle } from "@prisma/client";
import { createExpense, updateExpense, deleteExpense } from "@/app/(dashboard)/expenses/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkDeleteToolbar } from "@/components/ui/bulk-delete-toolbar";
import { bulkDeleteExpenses } from "@/app/(dashboard)/actions/delete";

type ExpenseWithVehicles = Expense & { vehicles: Pick<Vehicle, "BUS_NUMBER">[] };
type VehicleOption = Pick<Vehicle, "id" | "BUS_NUMBER">;

const EXPENSE_TYPES = ["Toll", "Parking", "Allowance", "Emergency", "Miscellaneous"] as const;

// ── List ─────────────────────────────────────────────────────────────────────

export function ExpenseList({ expenses }: { expenses: ExpenseWithVehicles[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredExpenses = expenses.filter(e => {
    const term = searchTerm.toLowerCase();
    const busMatch = e.vehicles.some(v => v.BUS_NUMBER.toLowerCase().includes(term));
    return (
      busMatch ||
      (e.NOTES?.toLowerCase()?.includes(term) ?? false) ||
      (e.TYPE.toLowerCase().includes(term))
    );
  });

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredExpenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredExpenses.map(e => e.id));
    }
  };

  const handleSelectTop10 = () => {
    const top10 = filteredExpenses.slice(0, 10).map(e => e.id);
    setSelectedIds(top10);
  };

  const handleBulkDelete = async () => {
    const res = await bulkDeleteExpenses(selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      alert("Delete failed: " + res.message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 relative page-enter pb-32">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-lux text-3xl">Expense Records</h1>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Vehicle Expense Details</p>
          </div>
          <div className="flex items-center gap-3">
            <ExportMenu 
              data={expenses.map(e => ({
                ...e,
                displayBuses: e.vehicles.map(v => v.BUS_NUMBER).join(", ")
              }))}
              filename="expense_records"
              title="Vehicle Expenditure Registry"
              headers={["DATE", "TYPE", "AMOUNT", "BUSES", "NOTES"]}
              keys={["DATE", "TYPE", "AMOUNT", "displayBuses", "NOTES"]}
            />
            <ImportZone onImport={bulkImportExpenses} label="Import" />
            <Link href="/expenses/new">
              <Button className="btn-yellow-premium h-10 px-6 rounded-14">
                <Plus className="mr-2 h-4.5 w-4.5" strokeWidth={3} /> Add Expense
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 max-w-sm">
          <div className="relative w-full group">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by vehicle or expense type..."
              className="input-lux pl-11 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="panel-lux">
          <Table>
            <TableHeader className="tbl-head">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedIds.length > 0 && selectedIds.length === filteredExpenses.length}
                    onChange={handleSelectAll}
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </TableHead>
                <TableHead>Expense Date</TableHead>
                <TableHead>Expense Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Associated Buses</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>ADMIN</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center text-white/20 font-bold uppercase tracking-widest text-xs">
                    {searchTerm ? "No fiscal records matching search." : "No expenditure logs in active ledger."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((e) => (
                  <TableRow key={e.id} className={cn("tbl-row group", selectedIds.includes(e.id) && "bg-primary/5")}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(e.id)}
                        onChange={() => handleSelectRow(e.id)}
                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableCell>
                    <TableCell className="font-bold text-white/60">{formatDate(e.DATE)}</TableCell>
                    <TableCell className="font-black text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                          <Banknote className="h-4 w-4 text-primary" />
                        </div>
                        {e.TYPE}
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-emerald-500">₹{e.AMOUNT.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {e.vehicles.length > 0 ? (
                          e.vehicles.map((v, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                              {v.BUS_NUMBER}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] font-black text-white/20 uppercase">System</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-[11px] font-medium text-white/30 italic">{e.NOTES || "No additional context."}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                          <Plus size={8} className="text-primary" />
                          <span>{e.createdBy || "System"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                          <Edit size={8} className="text-primary" />
                          <span>{e.updatedBy || "System"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/expenses/${e.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg">
                            <Plus className="h-4 w-4 rotate-45" />
                          </Button>
                        </Link>
                        <DeleteButton 
                          onDelete={async () => { await deleteExpense(e.id); }} 
                          itemName={`Expense ${e.TYPE}`}
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

      <BulkDeleteToolbar 
        selectedCount={selectedIds.length}
        totalAvailable={filteredExpenses.length}
        onDelete={handleBulkDelete}
        onSelectAll={handleSelectAll}
        onSelectTop10={handleSelectTop10}
        onClear={() => setSelectedIds([])}
      />
    </>
  );
}

// ── Shared form fields ────────────────────────────────────────────────────────

function ExpenseFields({ vehicles, defaults, defaultVehicleIds = [] }: { vehicles: VehicleOption[]; defaults?: Partial<Expense>, defaultVehicleIds?: string[] }) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <div className="space-y-2.5">
          <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">Expense Type</Label>
          <Select name="type" defaultValue={defaults?.TYPE ?? "Toll"} required>
            <SelectTrigger className="input-lux h-12"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent className="bg-[#121418] border-white/10">
              {EXPENSE_TYPES.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="amount" className="text-[11px] font-black uppercase tracking-widest text-white/40">Expense Amount (₹)</Label>
          <Input id="amount" name="amount" type="number" step="0.01" defaultValue={defaults?.AMOUNT ?? ""} placeholder="e.g. 1500.00" className="input-lux h-12" required />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="date" className="text-[11px] font-black uppercase tracking-widest text-white/40">Expense Date</Label>
          <Input id="date" name="date" type="date" required className="input-lux h-12"
            defaultValue={defaults?.DATE ? new Date(defaults.DATE).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]} />
        </div>
        <div className="space-y-2.5">
          <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">Select Buses (Multi-Select)</Label>
          <VehicleSearch 
            vehicles={vehicles} 
            defaultValue={defaultVehicleIds} 
            placeholder="Select one or more buses..." 
            multi 
          />
        </div>
      </div>
      <div className="space-y-2.5 pt-6 border-t border-white/5">
        <Label htmlFor="notes" className="text-[11px] font-black uppercase tracking-widest text-white/40">Additional Notes</Label>
        <Input id="notes" name="notes" defaultValue={defaults?.NOTES ?? ""} placeholder="Provide context for audit trailing..." className="input-lux h-12" />
      </div>
    </div>
  );
}

// ── Create Form ───────────────────────────────────────────────────────────────

export function ExpenseForm({ vehicles }: { vehicles: VehicleOption[] }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full page-enter">
      <div className="flex items-center gap-5">
        <Link href="/expenses">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-3xl">Add Expense</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">New Fiscal Entry</p>
        </div>
      </div>

      <div className="panel-lux p-8 border-white/10">
        <form action={createExpense} onSubmit={() => setLoading(true)} className="space-y-10">
          <ExpenseFields vehicles={vehicles} />
          <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
            <Link href="/expenses">
              <Button variant="ghost" type="button" className="h-12 px-8 rounded-16 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="btn-yellow-premium h-12 px-10 rounded-16 min-w-[200px]">
              {loading ? "Processing..." : "Save Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Form ─────────────────────────────────────────────────────────────────

export function ExpenseEditForm({ expense, vehicles }: { expense: Expense & { vehicles: { id: string }[] }; vehicles: VehicleOption[] }) {
  const [loading, setLoading] = useState(false);
  const action = updateExpense.bind(null, expense.id);
  const vehicleIds = expense.vehicles.map(v => v.id);
  
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full page-enter">
      <div className="flex items-center gap-5">
        <Link href="/expenses">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-3xl">Edit Expense</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Update Expense Record</p>
        </div>
      </div>

      <div className="panel-lux p-8 border-white/10">
        <form action={action} onSubmit={() => setLoading(true)} className="space-y-10">
          <ExpenseFields 
            vehicles={vehicles} 
            defaults={expense} 
            defaultVehicleIds={vehicleIds} 
          />
          <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
            <Link href="/expenses">
              <Button variant="ghost" type="button" className="h-12 px-8 rounded-16 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="btn-yellow-premium h-12 px-10 rounded-16 min-w-[200px]">
              {loading ? "Processing..." : "Save Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
