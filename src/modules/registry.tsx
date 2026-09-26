"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  User,
  Bus,
  MapPin,
  Calendar,
  Trash2,
  Edit
} from "lucide-react";
import { ImportZone } from "@/components/ui/import-zone";
import { ExportMenu } from "@/components/ui/export-menu";
import { bulkImportRegistry } from "@/app/(dashboard)/actions/import";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkDeleteToolbar } from "@/components/ui/bulk-delete-toolbar";
import { bulkDeleteRegistryRecords } from "@/app/(dashboard)/actions/delete";

export function TransportLedger({ records }: { records: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = records.filter(r => 
    r.NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.REGISTER_NUMBER.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.BUS_NUMBER?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.CHALLAN_NUMBER?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(r => r.id));
    }
  };

  const handleBulkDelete = async () => {
    const res = await bulkDeleteRegistryRecords(selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      alert("Delete failed: " + res.message);
    }
  };

  const stats = [
    { label: "Total Records", value: records.length, icon: Hash, color: "text-primary" },
    { label: "Total Paid", value: records.filter(r => r.PAYMENT_STATUS === "PAID").length, icon: CheckCircle2, color: "text-green-400" },
    { label: "Pending", value: records.filter(r => r.PAYMENT_STATUS !== "PAID").length, icon: Clock, color: "text-amber-400" },
    { label: "Total Fees", value: `₹${records.reduce((sum, r) => sum + (r.AMOUNT || 0), 0).toLocaleString()}`, icon: CreditCard, color: "text-blue-400" },
  ];

  return (
    <>
      <div className="space-y-8 page-enter pb-32">
        {/* Header & Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-display-lux text-3xl">Transport Ledger</h1>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Master Institutional Registry System</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search Ledger (Name, Reg No, Challan...)" 
                className="input-lux pl-11 w-full sm:w-[350px] h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ImportZone 
              onImport={bulkImportRegistry} 
              label="Master Import" 
              className="btn-yellow-premium h-12 px-6"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="card-metric-lux">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/40 font-black uppercase tracking-widest text-[10px] mb-1">{s.label}</p>
                  <h3 className="text-2xl font-black text-white">{s.value}</h3>
                </div>
                <div className={cn("p-2 rounded-xl bg-white/5", s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Table */}
        <div className="panel-lux overflow-hidden border-white/10">
          <div className="panel-header-lux">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <span className="font-black uppercase tracking-tighter text-white">Central Operations Record</span>
            </div>
            <div className="flex items-center gap-2">
              <ExportMenu 
                data={records}
                filename="transport_ledger"
                title="Master Transport Ledger"
                headers={["NAME", "REG NO", "YEAR", "DEGREE", "BUS", "BOARDING POINT", "AMOUNT", "STATUS"]}
                keys={["NAME", "REGISTER_NUMBER", "YEAR", "DEGREE", "BUS_NUMBER", "BOARDING_POINT", "AMOUNT", "PAYMENT_STATUS"]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="tbl-head">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                      onChange={handleSelectAll}
                      className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableHead>
                  <TableHead>Serial & Student</TableHead>
                  <TableHead>Academic Info</TableHead>
                  <TableHead>Allocation</TableHead>
                  <TableHead>Financial Data</TableHead>
                  <TableHead>Office Ref</TableHead>
                  <TableHead>ADMIN</TableHead>
                  <TableHead className="text-right">Sync Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className={cn("tbl-row group", selectedIds.includes(r.id) && "bg-primary/5")}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(r.id)}
                        onChange={() => handleSelectRow(r.id)}
                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-primary/60 bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/10">{r.SERIAL_NUMBER || "—"}</span>
                          <span className="font-black text-white">{r.NAME}</span>
                        </div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{r.REGISTER_NUMBER}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-white/70">{r.YEAR} Year • {r.DEGREE}</p>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-tight">{r.BRANCH}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-white/60">
                          <Bus className="h-3 w-3 text-primary" />
                          <span>{r.BUS_NUMBER || "UNASSIGNED"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 italic">
                          <MapPin className="h-3 w-3" />
                          <span>{r.BOARDING_POINT || "Point Pending"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-white">₹{r.AMOUNT?.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border-none",
                            r.PAYMENT_STATUS === "PAID" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                          )}>
                            {r.PAYMENT_STATUS || "PENDING"}
                          </Badge>
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{r.PAYMENT_MODE}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-white/70">
                          <span className="text-primary/60 italic text-[10px]">#</span>
                          {r.CHALLAN_NUMBER || "NO_CHALLAN"}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                          <span className="bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5">O: {r.ORDER || "—"}</span>
                          <span className="bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5">B: {r.BUNCH || "—"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                          <Plus size={8} className="text-primary" />
                          <span>{r.createdBy || "System"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                          <Edit size={8} className="text-primary" />
                          <span>{r.updatedBy || "System"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-green-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Synced</span>
                        </div>
                        <span className="text-[9px] font-bold text-white/10 uppercase tracking-tighter">{formatDate(r.createdAt)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <BulkDeleteToolbar 
        selectedCount={selectedIds.length}
        totalAvailable={filtered.length}
        onDelete={handleBulkDelete}
        onSelectAll={handleSelectAll}
        onSelectTop10={() => setSelectedIds(filtered.slice(0, 10).map(r => r.id))}
        onClear={() => setSelectedIds([])}
      />
    </>
  );
}
