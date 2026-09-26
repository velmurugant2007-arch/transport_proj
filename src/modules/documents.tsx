"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Download, Plus, FileText, AlertTriangle, CheckCircle, 
  Shield, Leaf, FileCheck, Receipt, Car, ArrowLeft, 
  Search, Edit, Trash2
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateVehicleDocuments } from "@/app/(dashboard)/documents/actions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkDeleteToolbar } from "@/components/ui/bulk-delete-toolbar";
import { bulkDeleteVehicles } from "@/app/(dashboard)/actions/delete";

export type VehicleDoc = {
  id: string; BUS_NUMBER: string; MAKE: string | null; MODEL: string | null; FUEL_TYPE: string;
  INSURANCE_NUMBER: string | null; INSURANCE_DUE_DATE: Date | null; INSURANCE_EXPIRY: Date | null;
  TAX_NUMBER: string | null; TAX_DUE_DATE: Date | null; TAX_EXPIRY: Date | null;
  ROAD_PERMIT_NUMBER: string | null; ROAD_PERMIT_EXPIRY: Date | null;
  POLLUTION_NUMBER: string | null; POLLUTION_EXPIRY: Date | null;
  FC_NUMBER: string | null; FC_EXPIRY: Date | null;
  createdBy: string | null; updatedBy: string | null;
};

const today = () => new Date();
const in30 = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d; };

function docStatus(expiry: Date | null): "expired" | "expiring" | "valid" | "missing" {
  if (!expiry) return "missing";
  const now = today();
  if (expiry < now) return "expired";
  if (expiry <= in30()) return "expiring";
  return "valid";
}

const statusStyle = {
  expired:  { label: "Expired",  bg: "rgba(239,68,68,0.1)",   color: "#EF4444", border: "rgba(239,68,68,0.2)" },
  expiring: { label: "Expiring", bg: "rgba(245,158,11,0.1)",  color: "#F59E0B", border: "rgba(245,158,11,0.2)" },
  valid:    { label: "Valid",    bg: "rgba(16,185,129,0.1)",  color: "#10B981", border: "rgba(16,185,129,0.2)" },
  missing:  { label: "Not Set",  bg: "rgba(148,163,184,0.08)",color: "#64748B", border: "rgba(148,163,184,0.15)" },
};

// ── List ─────────────────────────────────────────────────────────────────────

export function DocumentList({ vehicles }: { vehicles: VehicleDoc[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredVehicles = vehicles.filter(v => 
    v.BUS_NUMBER.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const res = await bulkDeleteVehicles(selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      alert("Delete failed: " + res.message);
    }
  };

  const alertCount = filteredVehicles.reduce((acc, v) => {
    const statuses = [
      docStatus(v.INSURANCE_EXPIRY),
      docStatus(v.TAX_EXPIRY),
      docStatus(v.ROAD_PERMIT_EXPIRY),
      docStatus(v.POLLUTION_EXPIRY),
      docStatus(v.FC_EXPIRY),
    ];
    return acc + statuses.filter(s => s === "expired" || s === "expiring").length;
  }, 0);

  return (
    <div className="flex flex-col gap-8 page-enter pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lux text-3xl">Vehicle Documents</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Vehicle Document Records</p>
        </div>
        <div className="flex items-center gap-3">
          {alertCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              {alertCount} Expiry Alert{alertCount > 1 ? "s" : ""}
            </div>
          )}
          <a href="/api/documents/export" download>
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold h-10 px-5 rounded-14">
              <Download className="mr-2 h-4 w-4" /> Export Records
            </Button>
          </a>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search vehicle number..."
            className="input-lux pl-11 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedIds(selectedIds.length === filteredVehicles.length ? [] : filteredVehicles.map(v => v.id))}
            className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white h-11 px-6 rounded-16 bg-white/[0.02] border border-white/5"
          >
            {selectedIds.length === filteredVehicles.length ? "Deselect All" : "Select All Assets"}
          </Button>
        </div>
      </div>

      {/* Summary metrics */}
      {vehicles.length > 0 && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
          {[
            { label: "Insurance",    icon: Shield,    field: "INSURANCE_EXPIRY"  as const },
            { label: "Road Tax",     icon: Receipt,   field: "TAX_EXPIRY"        as const },
            { label: "Permits",      icon: FileCheck, field: "ROAD_PERMIT_EXPIRY" as const },
            { label: "Pollution",    icon: Leaf,      field: "POLLUTION_EXPIRY"  as const },
            { label: "Fitness",      icon: Car,       field: "FC_EXPIRY"         as const },
          ].map((doc) => {
            const counts = { expired: 0, expiring: 0, valid: 0, missing: 0 };
            vehicles.forEach(v => {
              const s = docStatus(v[doc.field] as Date | null);
              counts[s]++;
            });
            const statusColor = counts.expired > 0 ? "text-rose-500" : counts.expiring > 0 ? "text-primary" : "text-emerald-500";
            return (
              <div key={doc.label} className="panel-lux p-5 border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <doc.icon className={cn("h-4 w-4", statusColor)} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{doc.label}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/20 uppercase">Expired</span>
                    <span className={cn("text-xs font-black", counts.expired > 0 ? "text-rose-500" : "text-white/10")}>{counts.expired}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/20 uppercase">Expiring</span>
                    <span className={cn("text-xs font-black", counts.expiring > 0 ? "text-primary" : "text-white/10")}>{counts.expiring}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/20 uppercase">Active</span>
                    <span className="text-xs font-black text-emerald-500">{counts.valid}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vehicle records */}
      {vehicles.length === 0 ? (
        <div className="panel-lux py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
            <FileText className="h-8 w-8 text-white/20" />
          </div>
          <p className="font-black text-white/60 tracking-tight uppercase">Registry Entry Required</p>
          <p className="text-xs text-white/20 font-bold mt-2 mb-6 max-w-xs uppercase tracking-widest leading-loose">Initialize assets in the fleet registry to activate compliance monitoring.</p>
          <Link href="/vehicles/new">
            <Button className="btn-yellow-premium h-11 px-8 rounded-16 font-black uppercase tracking-widest text-[11px]">
              <Plus className="mr-2 h-4 w-4" strokeWidth={3} /> Register Asset
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVehicles.map((vehicle) => {
            const docs = [
              { key: "insurance", label: "Insurance", icon: Shield, number: vehicle.INSURANCE_NUMBER, expiry: vehicle.INSURANCE_EXPIRY },
              { key: "tax", label: "Road Tax", icon: Receipt, number: vehicle.TAX_NUMBER, expiry: vehicle.TAX_EXPIRY },
              { key: "permit", label: "Road Permit", icon: FileCheck, number: vehicle.ROAD_PERMIT_NUMBER, expiry: vehicle.ROAD_PERMIT_EXPIRY },
              { key: "pollution", label: "Pollution", icon: Leaf, number: vehicle.POLLUTION_NUMBER, expiry: vehicle.POLLUTION_EXPIRY },
              { key: "fc", label: "Fitness Cert.", icon: Car, number: vehicle.FC_NUMBER, expiry: vehicle.FC_EXPIRY },
            ];

            const hasAlert = docs.some(d => {
              const s = docStatus(d.expiry);
              return s === "expired" || s === "expiring";
            });

            return (
              <div key={vehicle.id} className={cn("panel-lux overflow-hidden transition-all duration-300", hasAlert ? "border-rose-500/20 shadow-[0_0_40px_rgba(239,68,68,0.05)]" : "border-white/5", selectedIds.includes(vehicle.id) && "border-primary bg-primary/5")}>
                {/* Vehicle header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <Checkbox 
                      checked={selectedIds.includes(vehicle.id)}
                      onChange={() => handleSelectRow(vehicle.id)}
                      className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Car className={cn("h-5 w-5", hasAlert ? "text-rose-500" : "text-primary")} />
                    </div>
                    <div>
                      <p className="text-base font-black text-white tracking-tight">{vehicle.BUS_NUMBER}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{vehicle.MAKE} {vehicle.MODEL} · {vehicle.FUEL_TYPE}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasAlert && (
                      <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/20">Audit Alert</span>
                    )}
                    <Link href={`/documents/${vehicle.id}/edit`}>
                      <Button variant="outline" className="h-9 px-5 rounded-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[11px] uppercase tracking-widest">Update Certification</Button>
                    </Link>
                  </div>
                </div>

                {/* Docs grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-white/5 bg-white/[0.01]">
                  {docs.map((doc) => {
                    const status = docStatus(doc.expiry);
                    const style = statusStyle[status];
                    return (
                      <div key={doc.key} className="p-5 flex flex-col items-center text-center group hover:bg-white/5 transition-colors">
                        <doc.icon className="h-5 w-5 mb-3 group-hover:scale-110 transition-transform" style={{ color: style.color }} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">{doc.label}</span>
                        
                        <Badge className="mb-4 font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-full" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                          {style.label}
                        </Badge>

                        {doc.number ? (
                          <p className="text-[10px] font-black text-white/60 mb-2 truncate max-w-full font-mono">{doc.number}</p>
                        ) : (
                          <p className="text-[10px] font-black text-white/10 mb-2 uppercase tracking-widest italic">Not Set</p>
                        )}

                        {doc.expiry ? (
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Expiry Date</p>
                            <p className="text-[11px] font-black text-white/80">{formatDate(doc.expiry)}</p>
                          </div>
                        ) : (
                          <p className="text-[11px] font-black text-white/5 uppercase tracking-widest">Pending</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BulkDeleteToolbar 
        selectedCount={selectedIds.length}
        totalAvailable={filteredVehicles.length}
        onDelete={handleBulkDelete}
        onSelectAll={() => setSelectedIds(filteredVehicles.map(v => v.id))}
        onSelectTop10={() => setSelectedIds(filteredVehicles.slice(0, 10).map(v => v.id))}
        onClear={() => setSelectedIds([])}
      />
    </div>
  );
}

// ── Edit Form ─────────────────────────────────────────────────────────────────

const fmt = (d: Date | null | undefined) => d ? new Date(d).toISOString().split("T")[0] : "";

function DocSection({ icon: Icon, title, status, children }: { icon: any; title: string; status: string; children: React.ReactNode }) {
  return (
    <div className="panel-lux overflow-hidden border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
            <Icon className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Active Field</span>
        </div>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {children}
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", defaultValue }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return (
    <div className="space-y-2.5">
      <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">{label}</Label>
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue || ""}
        className="input-lux h-12 text-sm font-bold"
        placeholder={type === "date" ? "" : "Identify Reference No."}
      />
    </div>
  );
}

export function DocumentEditForm({ vehicle }: { vehicle: VehicleDoc }) {
  const [loading, setLoading] = useState(false);
  const action = updateVehicleDocuments.bind(null, vehicle.id);

  return (
    <div className="flex flex-col gap-10 page-enter max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-6">
        <Link href="/documents">
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-xl">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-4xl">Update Documents</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[11px] mt-2">
            Asset: <span className="text-primary">{vehicle.BUS_NUMBER}</span> · {vehicle.MAKE} {vehicle.MODEL}
          </p>
        </div>
      </div>

      <form action={action} onSubmit={() => setLoading(true)} className="space-y-6 pb-20">
        <DocSection icon={Shield} title="Insurance Details" status="active">
          <Field label="Policy Number" name="insuranceNumber" defaultValue={vehicle.INSURANCE_NUMBER ?? ""} />
          <Field label="Due Timeline" name="insuranceDueDate" type="date" defaultValue={fmt(vehicle.INSURANCE_DUE_DATE)} />
          <Field label="Expiry Date" name="insuranceExpiry" type="date" defaultValue={fmt(vehicle.INSURANCE_EXPIRY)} />
        </DocSection>

        <DocSection icon={Receipt} title="Road Tax Details" status="active">
          <Field label="Tax Number" name="taxNumber" defaultValue={vehicle.TAX_NUMBER ?? ""} />
          <Field label="Due Timeline" name="taxDueDate" type="date" defaultValue={fmt(vehicle.TAX_DUE_DATE)} />
          <Field label="Expiry Date" name="taxExpiry" type="date" defaultValue={fmt(vehicle.TAX_EXPIRY)} />
        </DocSection>

        <DocSection icon={FileCheck} title="Road Permit" status="active">
          <Field label="Permit Number" name="roadPermitNumber" defaultValue={vehicle.ROAD_PERMIT_NUMBER ?? ""} />
          <Field label="Expiry Date" name="roadPermitExpiry" type="date" defaultValue={fmt(vehicle.ROAD_PERMIT_EXPIRY)} />
          <div className="hidden md:block" />
        </DocSection>

        <DocSection icon={Leaf} title="Pollution Certificate" status="active">
          <Field label="Certificate ID" name="pollutionNumber" defaultValue={vehicle.POLLUTION_NUMBER ?? ""} />
          <Field label="Expiry Date" name="pollutionExpiry" type="date" defaultValue={fmt(vehicle.POLLUTION_EXPIRY)} />
          <div className="hidden md:block" />
        </DocSection>

        <DocSection icon={Car} title="Fitness Audit (FC)" status="active">
          <Field label="FC Number" name="fcNumber" defaultValue={vehicle.FC_NUMBER ?? ""} />
          <Field label="Expiry Date" name="fcExpiry" type="date" defaultValue={fmt(vehicle.FC_EXPIRY)} />
          <div className="hidden md:block" />
        </DocSection>

        {/* Audit Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="panel-lux p-6 border-white/5 bg-white/[0.02]">
            <p className="text-[10px] font-black text-white/20 uppercase mb-2">Registration Authority</p>
            <div className="flex items-center gap-2 text-white">
              <Plus size={12} className="text-primary" />
              <p className="text-sm font-bold">{vehicle.createdBy || "System"}</p>
            </div>
          </div>
          <div className="panel-lux p-6 border-white/5 bg-white/[0.02]">
            <p className="text-[10px] font-black text-white/20 uppercase mb-2">Last Certification Update</p>
            <div className="flex items-center gap-2 text-white">
              <Edit size={12} className="text-primary" />
              <p className="text-sm font-bold">{vehicle.updatedBy || "System"}</p>
            </div>
          </div>
        </div>

        <div className="panel-lux p-8 border-white/10 bg-white/[0.04] flex items-center justify-between shadow-2xl">
          <Link href="/documents">
            <Button variant="ghost" type="button" className="h-14 px-10 rounded-16 font-black uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/5 transition-all">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="btn-yellow-premium h-14 px-14 rounded-16 min-w-[240px] shadow-[0_0_50px_rgba(244,180,0,0.2)]">
            {loading ? "Saving..." : "Save Document"}
          </Button>
        </div>
      </form>
    </div>
  );
}
