import prisma from "@/lib/prisma";
import {
  BusFront, Users, Map, Fuel, Wrench, TrendingUp,
  AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react";
import { DashboardCalculators } from "@/modules/dashboard-calculators";
import { formatDate } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const [
    totalVehicles, activeVehicles,
    totalStudents, assignedStudents,
    totalRoutes,
    recentFuel, recentMaintenance,
    vehicles,
    vehicleList,
    revenue, pending,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { deletedAt: null } }),
    prisma.vehicle.count({ where: { STATUS: "ACTIVE", deletedAt: null } }),
    prisma.student.count({ where: { deletedAt: null } }),
    prisma.student.count({ where: { assignedBusId: { not: null }, deletedAt: null } }),
    prisma.route.count({ where: { deletedAt: null } }),
    prisma.fuelLog.findMany({ 
      where: { deletedAt: null },
      take: 6, 
      orderBy: { DATE: "desc" }, 
      include: { vehicle: { select: { BUS_NUMBER: true } } } 
    }),
    prisma.maintenanceLog.findMany({ 
      where: { deletedAt: null },
      take: 4, 
      orderBy: { DATE: "desc" }, 
      include: { vehicle: { select: { BUS_NUMBER: true } } } 
    }),
    prisma.vehicle.findMany({
      where: { deletedAt: null },
      select: { INSURANCE_EXPIRY:true, TAX_EXPIRY:true, ROAD_PERMIT_EXPIRY:true, POLLUTION_EXPIRY:true, FC_EXPIRY:true },
    }),
    prisma.vehicle.findMany({ 
      where: { deletedAt: null },
      select: { id: true, BUS_NUMBER: true }, 
      orderBy: { BUS_NUMBER: "asc" } 
    }),
    prisma.student.aggregate({
      where: { PAYMENT_STATUS: "PAID", deletedAt: null },
      _sum: { AMOUNT: true }
    }),
    prisma.student.aggregate({
      where: { PAYMENT_STATUS: { in: ["PENDING", "UNPAID"] }, deletedAt: null },
      _sum: { AMOUNT: true }
    }),
  ]);

  const totalRevenue = revenue._sum.AMOUNT || 0;
  const pendingRevenue = pending._sum.AMOUNT || 0;

  const in30 = new Date(); in30.setDate(in30.getDate() + 30);
  const expiryAlerts = vehicles.filter(v =>
    [v.INSURANCE_EXPIRY, v.TAX_EXPIRY, v.ROAD_PERMIT_EXPIRY, v.POLLUTION_EXPIRY, v.FC_EXPIRY]
      .some(d => d && d <= in30)
  ).length;

  return { 
    totalVehicles, activeVehicles,
    totalStudents, assignedStudents,
    totalRoutes, recentFuel, recentMaintenance, expiryAlerts, vehicleList,
    totalRevenue, pendingRevenue
  };
}

function MetricCard({
  label, value, sub, icon: Icon, iconClass,
  trend, trendLabel, accentColor, href,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconClass: string;
  trend?: "up" | "down"; trendLabel?: string; accentColor?: string;
  href?: string;
}) {
  const CardContent = (
    <div className="card-metric-lux group cursor-pointer transition-all hover:border-primary/30">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${accentColor ?? "rgba(6,182,212,0.06)"} 0%, transparent 60%)`,
          borderRadius: "20px",
        }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${iconClass}`} style={{ borderRadius:"12px" }}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="flex items-center gap-2">
            {trend && trendLabel && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                style={{
                  background: trend === "up" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color:      trend === "up" ? "#22C55E"             : "#EF4444",
                  border: `1px solid ${trend === "up" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}
              >
                {trend === "up"
                  ? <ArrowUpRight className="h-3 w-3" />
                  : <ArrowDownRight className="h-3 w-3" />
                }
                {trendLabel}
              </div>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
        <p className="text-metric-lux mb-1">{value}</p>
        <p className="text-label-lux uppercase tracking-widest font-black" style={{ fontSize:"11px" }}>{label}</p>
        {sub && <p className="text-meta-lux mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{CardContent}</Link>;
  }

  return CardContent;
}

export default async function DashboardPage() {
  const s = await getDashboardStats();
  const fleetOcc   = s.totalVehicles ? Math.round((s.activeVehicles / s.totalVehicles) * 100) : 0;
  const stuAlloc   = s.totalStudents  ? Math.round((s.assignedStudents / s.totalStudents) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 page-enter pb-16">

      {/* Page heading */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-micro-lux mb-1.5 text-primary/80 font-black tracking-[0.3em]">TRANSPORT MANAGEMENT</p>
          <h1 className="text-h1-lux tracking-tighter">Overview</h1>
        </div>
        <div
          className="hidden md:flex items-center gap-3 px-5 py-2.5 rounded-2xl backdrop-blur-3xl"
          style={{ background:"rgba(244,180,0,0.08)", border:"2px solid #F4B400", boxShadow: "0 0 40px rgba(244,180,0,0.1)" }}
        >
          <Activity className="h-4 w-4 animate-pulse text-[#F4B400]" />
          <span className="text-[12px] font-black uppercase tracking-widest text-white">Transport Status: Active</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          label="TOTAL BUSSES" value={s.totalVehicles} sub={`${s.activeVehicles} operational units`}
          icon={BusFront} iconClass="icon-orange-lux"
          trend="up" trendLabel={`${fleetOcc}%`} accentColor="rgba(244,180,0,0.15)"
          href="/vehicles"
        />
        <MetricCard
          label="TOTAL STUDENTS" value={s.totalStudents} sub={`${s.assignedStudents} allocated`}
          icon={Users} iconClass="icon-blue-lux"
          trend="up" trendLabel={`${stuAlloc}%`} accentColor="rgba(59,130,246,0.1)"
          href="/students"
        />
        <MetricCard
          label="TOTAL ROUTES" value={s.totalRoutes} sub="Logistics Network"
          icon={Map} iconClass="icon-green-lux"
          trend="up" trendLabel="Active" accentColor="rgba(34,197,94,0.1)"
          href="/routes"
        />
        <MetricCard
          label="ALERTS" value={s.expiryAlerts} sub="Regulatory verification"
          icon={AlertTriangle}
          iconClass={s.expiryAlerts > 0 ? "icon-red-lux" : "icon-green-lux"}
          trend={s.expiryAlerts > 0 ? "down" : "up"}
          trendLabel={s.expiryAlerts > 0 ? "Action Required" : "Compliant"}
          accentColor={s.expiryAlerts > 0 ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)"}
          href="/vehicles"
        />
      </div>

      {/* Calculators Section */}
      <DashboardCalculators vehicles={s.vehicleList} />

      {/* Bottom: Fuel table + side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Fuel Logs Table */}
        <div className="lg:col-span-3 panel-lux border-white/5 overflow-hidden">
          <div className="panel-header-lux px-7 py-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 icon-amber-lux flex items-center justify-center shrink-0">
                <Fuel className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[14px] font-black text-white tracking-tight uppercase">Recent Fuel Logs</p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Fuel Usage History</p>
              </div>
            </div>
            <div className="badge-premium" style={{ borderColor: "#F4B400", color: "#FFFFFF" }}>{s.recentFuel.length} entries</div>
          </div>
          <div className="p-2 overflow-x-auto">
            {s.recentFuel.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No logistics records found</p>
              </div>
            ) : (
              <div className="min-w-[600px]">
              <table className="w-full">
                <thead>
                  <tr className="tbl-head">
                    <th className="pl-5">Asset</th>
                    <th className="">Energy</th>
                    <th className="text-right">Volume</th>
                    <th className="text-right">Investment</th>
                    <th className="text-right pr-5">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {s.recentFuel.map((f) => (
                    <tr key={f.id} className="tbl-row group hover:bg-white/[0.02]">
                      <td className="pl-5 font-black text-white">{f.vehicle.BUS_NUMBER}</td>
                      <td><span className="badge-premium">{f.FUEL_TYPE}</span></td>
                      <td className="text-right font-bold text-white/60">{f.LITRES.toFixed(1)} L</td>
                      <td className="text-right font-black text-white">₹{f.AMOUNT.toFixed(0)}</td>
                      <td className="text-right pr-5 text-[11px] font-bold text-white/30 group-hover:text-white/60 transition-colors uppercase tracking-wider">
                        {formatDate(f.DATE)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>

        {/* Maintenance */}
        <div className="lg:col-span-2 panel-lux border-white/5">
          <div className="panel-header-lux px-7 py-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 icon-orange-lux flex items-center justify-center shrink-0">
                <Wrench className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[14px] font-black text-white tracking-tight uppercase">Maintenance Status</p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Vehicle Service Records</p>
              </div>
            </div>
          </div>
          <div className="p-7 space-y-6">
            {s.recentMaintenance.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-14 justify-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-widest">Fleet Integrity Secured</p>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Zero critical maintenance alerts</p>
                </div>
              </div>
            ) : (
              s.recentMaintenance.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#F4B400] group-hover:scale-125 transition-transform" />
                    <div>
                      <p className="text-[13px] font-black text-white tracking-tight">{m.vehicle.BUS_NUMBER}</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">{m.SERVICE_TYPE} · {formatDate(m.DATE)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-black text-white">₹{m.AMOUNT.toFixed(0)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
