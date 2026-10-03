"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Plus, Search, Download, User, Hash, 
  Bus, MapPin, CreditCard, Clock, CheckCircle2,
  Filter, ArrowLeft, ArrowUpRight, GraduationCap,
  Calendar, Layers, MapPinned, Info, Edit
} from "lucide-react";
import { bulkImportStudents } from "@/app/(dashboard)/actions/import";
import { ImportZone } from "@/components/ui/import-zone";
import { ExportMenu } from "@/components/ui/export-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Student, Route, Stop } from "@prisma/client";
import { createStudent, updateStudent, deleteStudent } from "@/app/(dashboard)/students/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { cn } from "@/lib/utils";
import { BulkDeleteToolbar } from "@/components/ui/bulk-delete-toolbar";
import { bulkDeleteStudents } from "@/app/(dashboard)/actions/delete";

export function StudentList({ students }: { students: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = students.filter(s => 
    s.STUDENT_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.REGISTER_NUMBER.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.BUS_NUMBER?.toLowerCase().includes(searchTerm.toLowerCase())
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
      setSelectedIds(filtered.map(s => s.id));
    }
  };

  const handleBulkDelete = async () => {
    const res = await bulkDeleteStudents(selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      alert("Delete failed: " + res.message);
    }
  };

  const stats = [
    { label: "Total Students", value: students.length, icon: Users, color: "text-primary" },
    { label: "PAID Students", value: students.filter(s => s.PAYMENT_STATUS === "PAID").length, icon: CheckCircle2, color: "text-green-400" },
    { label: "Pending Students", value: students.filter(s => s.PAYMENT_STATUS !== "PAID").length, icon: Clock, color: "text-amber-400" },
  ];

  function Users(props: any) { return <User {...props} /> }

  return (
    <>
      <div className="flex flex-col gap-6 relative page-enter pb-32">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-display-lux text-2xl md:text-3xl">Students</h1>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Student Transport Records</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <ExportMenu 
              data={filtered}
              filename="student_records"
              title="Student Transport Records"
              headers={["REG NO", "NAME", "YEAR", "DEGREE", "BRANCH", "BOARDING POINT", "BUS", "BUS REG", "AREA", "AMOUNT", "CHALLAN", "ORDER", "BUNCH", "STATUS"]}
              keys={["REGISTER_NUMBER", "STUDENT_NAME", "YEAR", "DEGREE", "BRANCH", "BOARDING_POINT", "BUS_NUMBER", "BUS_REG_NUMBER", "AREA", "AMOUNT", "CHALLAN_NUMBER", "ORDER", "BUNCH", "PAYMENT_STATUS"]}
            />
            <ImportZone onImport={bulkImportStudents} label="Import" />
            <Link href="/students/new">
              <Button className="btn-yellow-premium h-10 px-4 md:px-6 rounded-14 text-xs md:text-sm">
                <Plus className="mr-1.5 md:mr-2 h-4 w-4 md:h-4.5 md:w-4.5" strokeWidth={3} /> Add Student
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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

        <div className="flex items-center gap-2 w-full md:max-w-sm">
          <div className="relative w-full group">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by name, register number..."
              className="input-lux pl-11 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="panel-lux overflow-hidden">
          
          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y divide-white/5">
            {filtered.map((s) => (
              <div key={s.id} className={cn("p-4 flex flex-col gap-3 transition-colors", selectedIds.includes(s.id) && "bg-primary/5")}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={selectedIds.includes(s.id)}
                      onChange={() => handleSelectRow(s.id)}
                      className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div>
                      <p className="text-sm font-black text-white uppercase">{s.STUDENT_NAME}</p>
                      <p className="text-[10px] font-bold text-white/40">{s.REGISTER_NUMBER} · {s.YEAR || "N/A"}</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border-none",
                    s.PAYMENT_STATUS === "PAID" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                  )}>
                    {s.PAYMENT_STATUS}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-1 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Bus</p>
                    <p className="text-xs font-black text-primary">{s.BUS_NUMBER || "UNASSIGNED"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Boarding</p>
                    <p className="text-xs font-bold text-white/80 truncate">{s.BOARDING_POINT || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Amount</p>
                    <p className="text-xs font-black text-white">₹{s.AMOUNT?.toLocaleString() || "0"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Degree</p>
                    <p className="text-xs font-bold text-white/60">{s.DEGREE || "-"} / {s.BRANCH || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-[8px] font-black text-white/30 uppercase tracking-tighter">
                      <Plus size={8} className="text-primary" />
                      <span>{s.createdBy || "System"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/students/${s.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg">
                        <Plus className="h-4 w-4 rotate-45" />
                      </Button>
                    </Link>
                    <DeleteButton 
                      onDelete={async () => { await deleteStudent(s.id); }} 
                      itemName={s.STUDENT_NAME}
                    />
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-white/40 font-bold uppercase tracking-widest text-xs">No students found</div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[1200px]">
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
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">SL NO</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">REG NO</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">STUDENT NAME</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">YEAR</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">DEGREE</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">DEPT</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">BOARDING POINT</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">BUS NO</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">REG NO (BUS)</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">AREA</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">AMOUNT</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">CHALLAN</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">ORDER</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">BUNCH</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">STATUS</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">ADMIN</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-white/40">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className={cn("tbl-row group", selectedIds.includes(s.id) && "bg-primary/5")}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(s.id)}
                      onChange={() => handleSelectRow(s.id)}
                      className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableCell>
                  <TableCell className="text-[11px] font-bold text-white/60">{s.SERIAL_NUMBER || "-"}</TableCell>
                  <TableCell className="text-[11px] font-black text-white">{s.REGISTER_NUMBER}</TableCell>
                  <TableCell className="text-[12px] font-black text-white uppercase">{s.STUDENT_NAME}</TableCell>
                  <TableCell className="text-[11px] font-bold text-white/60">{s.YEAR || "-"}</TableCell>
                  <TableCell className="text-[11px] font-bold text-white/60 uppercase">{s.DEGREE || "-"}</TableCell>
                  <TableCell className="text-[11px] font-bold text-white/60 uppercase">{s.BRANCH || "-"}</TableCell>
                  <TableCell className="text-[11px] font-bold text-white/60 uppercase">{s.BOARDING_POINT || "-"}</TableCell>
                  <TableCell className="text-[11px] font-black text-primary">{s.BUS_NUMBER || "-"}</TableCell>
                  <TableCell className="text-[10px] font-bold text-white/40">{s.BUS_REG_NUMBER || "-"}</TableCell>
                  <TableCell className="text-[11px] font-bold text-white/60 uppercase">{s.AREA || "-"}</TableCell>
                  <TableCell className="text-[11px] font-black text-white whitespace-nowrap">₹{s.AMOUNT?.toLocaleString()}</TableCell>
                  <TableCell className="text-[11px] font-bold text-white/60">{s.CHALLAN_NUMBER || "-"}</TableCell>
                  <TableCell className="text-[11px] font-bold text-white/60">{s.ORDER || "-"}</TableCell>
                  <TableCell className="text-[11px] font-bold text-white/60">{s.BUNCH || "-"}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border-none",
                      s.PAYMENT_STATUS === "PAID" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {s.PAYMENT_STATUS}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                        <Plus size={8} className="text-primary" />
                        <span>{s.createdBy || "System"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                        <Edit size={8} className="text-primary" />
                        <span>{s.updatedBy || "System"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/students/${s.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg">
                          <Plus className="h-4 w-4 rotate-45" />
                        </Button>
                      </Link>
                      <DeleteButton 
                        onDelete={async () => { await deleteStudent(s.id); }} 
                        itemName={s.STUDENT_NAME}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          </div>
        </div>
      </div>

      <BulkDeleteToolbar 
        selectedCount={selectedIds.length}
        totalAvailable={filtered.length}
        onDelete={handleBulkDelete}
        onSelectAll={handleSelectAll}
        onSelectTop10={() => setSelectedIds(filtered.slice(0, 10).map(s => s.id))}
        onClear={() => setSelectedIds([])}
      />
    </>
  );
}

export function StudentFields({ 
  routes, 
  vehicles, 
  defaults = {} 
}: { 
  routes: (Route & { stops: Stop[] })[]; 
  vehicles: any[]; 
  defaults?: any 
}) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(defaults.routeId || "");
  const [selectedStopId, setSelectedStopId] = useState<string>(defaults.boardingPointId || "");
  const [boardingPoint, setBoardingPoint] = useState<string>(defaults.BOARDING_POINT || "");
  const [amount, setAmount] = useState<number>(defaults.AMOUNT || 0);
  const [paymentMode, setPaymentMode] = useState<string>(defaults.PAYMENT_MODE || "CASH");
  const [paymentStatus, setPaymentStatus] = useState<string>(defaults.PAYMENT_STATUS || "PENDING");
  const [order, setOrder] = useState<string>(defaults.ORDER || "");
  const [bunch, setBunch] = useState<string>(defaults.BUNCH || "");

  const currentRoute = routes.find(r => r.id === selectedRouteId);
  const currentStops = currentRoute?.stops || [];

  const handleRouteChange = (routeId: string | null) => {
    setSelectedRouteId(routeId ?? "");
    if (!routeId) {
      setBoardingPoint("");
      setAmount(0);
      setSelectedStopId("");
    } else {
      const route = routes.find(r => r.id === routeId);
      if (route && route.stops.length > 0) {
        const firstStop = route.stops[0];
        setBoardingPoint(firstStop.NAME);
        setAmount(firstStop.AMOUNT || 0);
        setSelectedStopId(firstStop.id);
      }
    }
  };

  const handleStopChange = (stopId: string | null) => {
    setSelectedStopId(stopId ?? "");
    const stop = currentStops.find(s => s.id === stopId);
    if (stop) {
      setBoardingPoint(stop.NAME);
      setAmount(stop.AMOUNT || 0);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Identity Group */}
      <section>
        <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-primary mb-5 md:mb-8 flex items-center gap-2 md:gap-3">
          <User size={16} className="md:w-[18px] md:h-[18px]" /> Student Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-8 md:gap-8">
          <div className="space-y-2.5">
            <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-white/40">Full Legal Name</Label>
            <Input id="name" name="name" defaultValue={defaults.STUDENT_NAME} placeholder="e.g. Adithya V" className="input-lux h-11" required />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="registerNumber" className="text-[11px] font-black uppercase tracking-widest text-white/40">Register Number</Label>
            <Input id="registerNumber" name="registerNumber" defaultValue={defaults.REGISTER_NUMBER} placeholder="e.g. 9213..." className="input-lux h-11" required />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="serialNumber" className="text-[11px] font-black uppercase tracking-widest text-white/40">Sl.No (Directory)</Label>
            <Input id="serialNumber" name="serialNumber" defaultValue={defaults.SERIAL_NUMBER} placeholder="e.g. 45" className="input-lux h-11" />
          </div>
        </div>
      </section>

      {/* Academic Group */}
      <section className="pt-6 md:pt-10 border-t border-white/5">
        <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-primary mb-5 md:mb-8 flex items-center gap-2 md:gap-3">
          <GraduationCap size={16} className="md:w-[18px] md:h-[18px]" /> Academic Context
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-5 gap-x-8 md:gap-8">
          <div className="space-y-2.5">
            <Label htmlFor="year" className="text-[11px] font-black uppercase tracking-widest text-white/40">Year of Study</Label>
            <Select name="year" defaultValue={defaults.YEAR || "1st"}>
              <SelectTrigger className="input-lux h-11"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#121418] border-white/10">
                {["1st", "2nd", "3rd", "4th", "MBA-1", "MBA-2"].map(y => <SelectItem key={y} value={y} className="font-bold">{y} Year</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="degree" className="text-[11px] font-black uppercase tracking-widest text-white/40">Degree</Label>
            <Input id="degree" name="degree" defaultValue={defaults.DEGREE} placeholder="e.g. B.E" className="input-lux h-11" />
          </div>
          <div className="space-y-2.5 md:col-span-2">
            <Label htmlFor="branch" className="text-[11px] font-black uppercase tracking-widest text-white/40">Department / Branch</Label>
            <Input id="branch" name="branch" defaultValue={defaults.BRANCH} placeholder="e.g. Computer Science Engineering" className="input-lux h-11" />
          </div>
        </div>
      </section>

      {/* Transportation Group */}
      <section className="pt-6 md:pt-10 border-t border-white/5">
        <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-primary mb-5 md:mb-8 flex items-center gap-2 md:gap-3">
          <Bus size={16} className="md:w-[18px] md:h-[18px]" /> Logistics Allocation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-10 md:gap-10">
          <div className="space-y-8">
            <div className="space-y-2.5">
              <Label className="text-[11px] font-black uppercase tracking-widest text-white/40">Strategic Route</Label>
              <Select value={selectedRouteId} onValueChange={handleRouteChange}>
                <SelectTrigger className="input-lux h-11"><SelectValue placeholder="Identify Route" /></SelectTrigger>
                <SelectContent className="bg-[#121418] border-white/10">
                  <SelectItem value="" className="font-bold text-primary italic">Manual Designation Only</SelectItem>
                  {routes.map(r => <SelectItem key={r.id} value={r.id} className="font-bold">{r.NAME}</SelectItem>)}
                </SelectContent>
              </Select>
              <input type="hidden" name="routeId" value={selectedRouteId} />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="boardingPoint" className="text-[11px] font-black uppercase tracking-widest text-white/40">Boarding Point</Label>
              <div className="relative">
                {selectedRouteId ? (
                  <Select value={selectedStopId} onValueChange={handleStopChange}>
                    <SelectTrigger className="input-lux h-11"><SelectValue placeholder="Select Point" /></SelectTrigger>
                    <SelectContent className="bg-[#121418] border-white/10">
                      {currentStops.map(s => <SelectItem key={s.id} value={s.id} className="font-bold">{s.NAME}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="boardingPoint" name="boardingPoint" value={boardingPoint} onChange={(e) => setBoardingPoint(e.target.value)} placeholder="e.g. Clock Tower" className="input-lux h-11" />
                )}
                {/* Hidden inputs to ensure boardingPoint and boardingPointId are submitted when using Select */}
                {selectedRouteId && (
                  <>
                    <input type="hidden" name="boardingPoint" value={boardingPoint} />
                    <input type="hidden" name="boardingPointId" value={selectedStopId} />
                  </>
                )}
              </div>
              {selectedRouteId && (
                <div className="flex items-center px-3 bg-primary/10 border border-primary/20 rounded-xl text-primary gap-2 animate-pulse">
                  <Info size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter py-1.5">Point-specific logistics auto-filled</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-2.5">
              <Label htmlFor="assignedBusId" className="text-[11px] font-black uppercase tracking-widest text-white/40">Vehicle Asset</Label>
              <Select name="assignedBusId" defaultValue={defaults.assignedBusId || ""}>
                <SelectTrigger className="input-lux h-11"><SelectValue placeholder="Identify Bus" /></SelectTrigger>
                <SelectContent className="bg-[#121418] border-white/10">
                  <SelectItem value="" className="font-bold text-white/30 italic">No Asset Assigned</SelectItem>
                  {vehicles.map(v => <SelectItem key={v.id} value={v.id} className="font-bold">Bus {v.BUS_NUMBER} (Cap: {v.CAPACITY})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="area" className="text-[11px] font-black uppercase tracking-widest text-white/40">Geographic Area</Label>
              <Input id="area" name="area" defaultValue={defaults.AREA} placeholder="e.g. Dindigul Central" className="input-lux h-11" />
            </div>
          </div>
        </div>
      </section>

      {/* Financial Group */}
      <section className="pt-6 md:pt-10 border-t border-white/5">
        <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-primary mb-5 md:mb-8 flex items-center gap-2 md:gap-3">
          <CreditCard size={16} className="md:w-[18px] md:h-[18px]" /> Financial Protocol
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-8 md:gap-8">
          <div className="space-y-2.5">
            <Label htmlFor="amount" className="text-[11px] font-black uppercase tracking-widest text-white/40">Annual Fee (₹)</Label>
            <Input id="amount" name="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="input-lux h-11 font-black text-white" required />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="paymentStatus" className="text-[11px] font-black uppercase tracking-widest text-white/40">Pass Activation Status</Label>
            <Select name="paymentStatus" value={paymentStatus} onValueChange={(v) => setPaymentStatus(v ?? "")}>
              <SelectTrigger className="input-lux h-11"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#121418] border-white/10">
                <SelectItem value="PENDING" className="font-bold text-amber-500">PENDING AUDIT</SelectItem>
                <SelectItem value="PAID" className="font-bold text-green-500">PAID & ACTIVE</SelectItem>
                <SelectItem value="UNPAID" className="font-bold text-red-500">UNPAID / OVERDUE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="paymentMode" className="text-[11px] font-black uppercase tracking-widest text-white/40">Transaction Channel</Label>
            <Select name="paymentMode" value={paymentMode} onValueChange={(v) => setPaymentMode(v ?? "")}>
              <SelectTrigger className="input-lux h-11"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#121418] border-white/10">
                {["CASH", "CARD", "ONLINE", "SCHOLARSHIP"].map(m => <SelectItem key={m} value={m} className="font-bold">{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Office Archiving Section */}
      <section className="pt-6 md:pt-10 border-t border-white/5">
        <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-primary mb-5 md:mb-8 flex items-center gap-2 md:gap-3">
          <Layers size={16} className="md:w-[18px] md:h-[18px]" /> Office Archiving
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 md:gap-8">
          <div className="space-y-2.5">
            <Label htmlFor="order" className="text-[11px] font-black uppercase tracking-widest text-white/40">Archive Order</Label>
            <Input id="order" name="order" value={order} onChange={(e) => setOrder(e.target.value)} placeholder="e.g. 001" className="input-lux h-11" />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="bunch" className="text-[11px] font-black uppercase tracking-widest text-white/40">Archive Bunch</Label>
            <Input id="bunch" name="bunch" value={bunch} onChange={(e) => setBunch(e.target.value)} placeholder="e.g. B-01" className="input-lux h-11" />
          </div>
        </div>
      </section>
    </div>
  );
}

export function StudentForm({ routes, vehicles }: { routes: any[]; vehicles: any[] }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-5xl mx-auto w-full page-enter">
      <div className="flex items-center gap-3 md:gap-5">
        <Link href="/students">
          <Button variant="outline" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-xl md:text-3xl">Add Student</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-0.5">New Enrollment</p>
        </div>
      </div>

      <div className="panel-lux p-4 md:p-8 border-white/10">
        <form action={createStudent} onSubmit={() => setLoading(true)}>
          <StudentFields routes={routes} vehicles={vehicles} />
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/5">
            <Link href="/students">
              <Button variant="ghost" type="button" className="w-full md:w-auto h-12 px-8 rounded-16 font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="btn-yellow-premium h-12 px-10 rounded-16 w-full md:w-auto md:min-w-[200px]">
              {loading ? "Processing..." : "Add Student"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StudentEditForm({ student, routes, vehicles }: { student: Student; routes: any[]; vehicles: any[] }) {
  const [loading, setLoading] = useState(false);
  const action = updateStudent.bind(null, student.id);
  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-5xl mx-auto w-full page-enter">
      <div className="flex items-center gap-3 md:gap-5">
        <Link href="/students">
          <Button variant="outline" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-display-lux text-xl md:text-3xl">Edit Student</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-0.5">Update Record: {student.STUDENT_NAME}</p>
        </div>
      </div>

      <div className="panel-lux p-4 md:p-8 border-white/10">
        <form action={action} onSubmit={() => setLoading(true)}>
          <StudentFields routes={routes} vehicles={vehicles} defaults={student} />
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/5">
            <Link href="/students">
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
