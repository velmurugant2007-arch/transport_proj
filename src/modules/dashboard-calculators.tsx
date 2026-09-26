"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Calculator, Calendar, Bus, Search, Check, Download, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateTotalExpense, calculateIndividualExpense } from "@/app/(dashboard)/dashboard/actions";
import { formatNumber } from "@/lib/format";

export function DashboardCalculators({ vehicles }: { vehicles: { id: string, BUS_NUMBER: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TotalExpenseCalculator />
      <IndividualVehicleCalculator vehicles={vehicles} />
    </div>
  );
}

function TotalExpenseCalculator() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ fuel: number, maintenance: number, misc: number, total: number, vehicleCount: number } | null>(null);
  const [animatedBusCount, setAnimatedBusCount] = useState(0);

  useEffect(() => {
    if (result && result.vehicleCount > 0) {
      let current = 0;
      const target = result.vehicleCount;
      const duration = 1000; // 1 second
      const stepTime = Math.max(duration / target, 20); // Minimum 20ms step
      
      const timer = setInterval(() => {
        current += Math.ceil(target / (duration / stepTime));
        if (current >= target) {
          setAnimatedBusCount(target);
          clearInterval(timer);
        } else {
          setAnimatedBusCount(current);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    } else {
      setAnimatedBusCount(0);
    }
  }, [result]);

  const handleCalculate = async () => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const data = await calculateTotalExpense(start, end);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-lux p-7 flex flex-col min-h-[420px] border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 icon-orange-lux flex items-center justify-center shrink-0">
          <TrendingUp className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[14px] font-black text-white tracking-tight uppercase">Total Expenses</p>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Expense Calculator</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Start Period</Label>
          <Input type="date" className="h-10 text-sm input-lux" value={start} onChange={e => setStart(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">End Period</Label>
          <Input type="date" className="h-10 text-sm input-lux" value={end} onChange={e => setEnd(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center py-4">
        {result ? (
          <div className="text-center animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4 mx-auto shadow-[0_0_40px_rgba(244,180,0,0.1)]">
              <Bus className="h-8 w-8 text-primary" />
            </div>
            <p className="text-4xl font-black text-white tracking-tighter mb-1">
              {animatedBusCount}
            </p>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">total number of buses calculated</p>
          </div>
        ) : (
          <div className="text-center opacity-20">
            <Bus className="h-12 w-12 text-white mx-auto mb-3" strokeWidth={1} />
            <p className="text-[9px] font-bold uppercase tracking-widest">No Data Available</p>
          </div>
        )}
      </div>

      <Button onClick={handleCalculate} disabled={loading || !start || !end} className="w-full btn-yellow-premium h-11 text-[11px] font-black uppercase tracking-widest mt-auto">
        <Calculator className="h-4 w-4 mr-2" /> {loading ? "Analyzing..." : "Generate Report"}
      </Button>

      {result && (
        <div className="mt-6 pt-6 border-t-2 border-[#F4B400]/30 space-y-3 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-white/40">Fuel Expenses</span>
            <span className="font-black text-white">₹{formatNumber(result.fuel)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-white/40">Maintenance Expenses</span>
            <span className="font-black text-white">₹{formatNumber(result.maintenance)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-white/40">Additional Expenses</span>
            <span className="font-black text-white">₹{formatNumber(result.misc)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-[#F4B400]/40">
            <span className="text-sm font-black text-white uppercase tracking-tight">Total Expenses</span>
            <span className="text-xl font-black text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]">₹{formatNumber(result.total)}</span>
          </div>
          <Button 
            onClick={() => {
              const doc = new jsPDF() as any;
              doc.setFontSize(22);
              doc.setTextColor(244, 180, 0);
              doc.text("INSTITUTIONAL EXPENSE REPORT", 14, 20);
              doc.setFontSize(12);
              doc.setTextColor(100);
              doc.text(`Period: ${start} to ${end}`, 14, 30);
              doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);
              
              autoTable(doc, {
                startY: 45,
                head: [["Category", "Amount (INR)"]],
                body: [
                  ["Fuel Expenses", `INR ${formatNumber(result.fuel)}`],
                  ["Maintenance Expenses", `INR ${formatNumber(result.maintenance)}`],
                  ["Additional Expenses", `INR ${formatNumber(result.misc)}`],
                  ["TOTAL EXPENDITURE", `INR ${formatNumber(result.total)}`],
                ],
                headStyles: { fillColor: [244, 180, 0] },
                styles: { fontSize: 12, cellPadding: 5 }
              });
              doc.save(`Total_Expense_Report_${start}_to_${end}.pdf`);
            }}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white h-10 rounded-12 mt-4 font-bold text-[10px] uppercase tracking-widest"
          >
            <FileText className="h-4 w-4 mr-2 text-primary" /> Download PDF Report
          </Button>
        </div>
      )}
    </div>
  );
}

function IndividualVehicleCalculator({ vehicles }: { vehicles: { id: string, BUS_NUMBER: string }[] }) {
  const [vehicleId, setVehicleId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ fuel: number, maintenance: number, misc: number, total: number } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCalculate = async () => {
    if (!vehicleId || !start || !end) return;
    setLoading(true);
    try {
      const data = await calculateIndividualExpense(vehicleId, start, end);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.BUS_NUMBER.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);

  return (
    <div className="card-lux p-7 flex flex-col min-h-[420px] border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 icon-blue-lux flex items-center justify-center shrink-0">
          <Bus className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[14px] font-black text-white tracking-tight uppercase">Vehicle Expense Report</p>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Vehicle Analysis</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="space-y-2 relative">
          <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Select Vehicle</Label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors z-10" />
            <Input 
              placeholder="Search registration number..."
              className="pl-10 h-10 text-sm input-lux font-semibold"
              value={isOpen ? searchQuery : (selectedVehicle?.BUS_NUMBER ?? "")}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
            {isOpen && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 max-h-[200px] overflow-y-auto bg-[#121418] border border-white/10 rounded-xl z-[100] shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setIsOpen(false)}
              >
                {filteredVehicles.length === 0 ? (
                  <div className="p-4 text-center text-white/20 text-[10px] font-black uppercase tracking-widest">No assets found</div>
                ) : (
                  filteredVehicles.map(v => (
                    <div 
                      key={v.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors group/item"
                      onClick={() => {
                        setVehicleId(v.id);
                        setSearchQuery(v.BUS_NUMBER);
                        setIsOpen(false);
                      }}
                    >
                      <span className="text-sm font-bold text-white/70 group-hover/item:text-white transition-colors">{v.BUS_NUMBER}</span>
                      {vehicleId === v.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  ))
                )}
              </div>
            )}
            {isOpen && (
              <div 
                className="fixed inset-0 z-[90]" 
                onClick={() => setIsOpen(false)}
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Start Point</Label>
            <Input type="date" className="h-10 text-sm input-lux" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">End Point</Label>
            <Input type="date" className="h-10 text-sm input-lux" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
        </div>
      </div>

      <Button onClick={handleCalculate} disabled={loading || !vehicleId || !start || !end} className="w-full btn-yellow-premium h-11 text-[11px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(244,180,0,0.2)] mt-auto">
        <Calculator className="h-4 w-4 mr-2" /> {loading ? "Analyzing Asset..." : "Generate Report"}
      </Button>

      {result && (
        <div className="mt-6 pt-6 border-t-2 border-[#F4B400]/30 space-y-3 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-white/40">Fuel Expenses</span>
            <span className="font-black text-white">₹{formatNumber(result.fuel)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-white/40">Maintenance Expenses</span>
            <span className="font-black text-white">₹{formatNumber(result.maintenance)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-white/40">Other Expenses</span>
            <span className="font-black text-white">₹{formatNumber(result.misc)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-[#F4B400]/40">
            <span className="text-sm font-black text-white uppercase tracking-tight">Total Vehicle Expenses</span>
            <span className="text-xl font-black text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]">₹{formatNumber(result.total)}</span>
          </div>
          <Button 
            onClick={() => {
              const doc = new jsPDF() as any;
              doc.setFontSize(22);
              doc.setTextColor(244, 180, 0);
              doc.text(`VEHICLE REPORT: BUS ${selectedVehicle?.BUS_NUMBER}`, 14, 20);
              doc.setFontSize(12);
              doc.setTextColor(100);
              doc.text(`Period: ${start} to ${end}`, 14, 30);
              doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);
              
              autoTable(doc, {
                startY: 45,
                head: [["Category", "Amount (INR)"]],
                body: [
                  ["Fuel Consumption", `INR ${formatNumber(result.fuel)}`],
                  ["Maintenance & Repair", `INR ${formatNumber(result.maintenance)}`],
                  ["Other Operating Expenses", `INR ${formatNumber(result.misc)}`],
                  ["TOTAL ASSET EXPENDITURE", `INR ${formatNumber(result.total)}`],
                ],
                headStyles: { fillColor: [244, 180, 0] },
                styles: { fontSize: 12, cellPadding: 5 }
              });
              doc.save(`Vehicle_Report_${selectedVehicle?.BUS_NUMBER}_${start}_to_${end}.pdf`);
            }}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white h-10 rounded-12 mt-4 font-bold text-[10px] uppercase tracking-widest"
          >
            <FileText className="h-4 w-4 mr-2 text-primary" /> Download PDF Report
          </Button>
        </div>
      )}
    </div>
  );
}
