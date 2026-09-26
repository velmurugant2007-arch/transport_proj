import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { AlertTriangle, CheckCircle, Bell, Shield, Receipt, FileCheck, Leaf, Car, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

type DocAlert = {
  type: string;
  expiry: Date;
  isExpired: boolean;
  daysLeft: number;
  icon: React.ElementType;
  color: string;
  bg: string;
};

function getDaysLeft(expiry: Date): number {
  return Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function NotificationsPage() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const now = new Date();

  const vehicles = await prisma.vehicle.findMany({
    where: {
      OR: [
        { INSURANCE_EXPIRY:   { lte: thirtyDaysFromNow } },
        { TAX_EXPIRY:         { lte: thirtyDaysFromNow } },
        { ROAD_PERMIT_EXPIRY: { lte: thirtyDaysFromNow } },
        { POLLUTION_EXPIRY:   { lte: thirtyDaysFromNow } },
        { FC_EXPIRY:          { lte: thirtyDaysFromNow } },
      ],
    },
    orderBy: { BUS_NUMBER: "asc" },
  });

  const totalAlerts = vehicles.reduce((acc, v) => {
    let c = 0;
    if (v.INSURANCE_EXPIRY   && v.INSURANCE_EXPIRY   <= thirtyDaysFromNow) c++;
    if (v.TAX_EXPIRY         && v.TAX_EXPIRY         <= thirtyDaysFromNow) c++;
    if (v.ROAD_PERMIT_EXPIRY && v.ROAD_PERMIT_EXPIRY <= thirtyDaysFromNow) c++;
    if (v.POLLUTION_EXPIRY   && v.POLLUTION_EXPIRY   <= thirtyDaysFromNow) c++;
    if (v.FC_EXPIRY          && v.FC_EXPIRY          <= thirtyDaysFromNow) c++;
    return acc + c;
  }, 0);

  const expiredCount = vehicles.reduce((acc, v) => {
    let c = 0;
    if (v.INSURANCE_EXPIRY   && v.INSURANCE_EXPIRY   < now) c++;
    if (v.TAX_EXPIRY         && v.TAX_EXPIRY         < now) c++;
    if (v.ROAD_PERMIT_EXPIRY && v.ROAD_PERMIT_EXPIRY < now) c++;
    if (v.POLLUTION_EXPIRY   && v.POLLUTION_EXPIRY   < now) c++;
    if (v.FC_EXPIRY          && v.FC_EXPIRY          < now) c++;
    return acc + c;
  }, 0);

  return (
    <div className="flex flex-col gap-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#F8FAFC" }}>
            Notifications
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#475569" }}>
            Document expiry alerts — Insurance · Tax · Road Permit · Pollution · FC
          </p>
        </div>
        {totalAlerts > 0 && (
          <Link href="/documents">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Manage Documents
            </div>
          </Link>
        )}
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "#162033", border: "1px solid rgba(148,163,184,0.08)", color: "#CBD5E1" }}
        >
          <Bell className="h-4 w-4" style={{ color: "#3B82F6" }} />
          {totalAlerts} total alert{totalAlerts !== 1 ? "s" : ""}
        </div>
        {expiredCount > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}
          >
            <AlertTriangle className="h-4 w-4" />
            {expiredCount} already expired
          </div>
        )}
        {totalAlerts - expiredCount > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}
          >
            <AlertTriangle className="h-4 w-4" />
            {totalAlerts - expiredCount} expiring soon
          </div>
        )}
      </div>

      {/* Alert cards */}
      {vehicles.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl gap-4"
          style={{ background: "#162033", border: "1px solid rgba(148,163,184,0.08)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.1)" }}
          >
            <CheckCircle className="h-7 w-7" style={{ color: "#10B981" }} />
          </div>
          <div className="text-center">
            <p className="font-semibold" style={{ color: "#CBD5E1" }}>All Documents Valid</p>
            <p className="text-sm mt-1" style={{ color: "#475569" }}>
              No vehicle documents are expiring within the next 30 days.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => {
            const docChecks: { type: string; expiry: Date | null; icon: React.ElementType; label: string }[] = [
              { type: "Insurance",   expiry: vehicle.INSURANCE_EXPIRY,   icon: Shield,    label: "Insurance" },
              { type: "Tax",         expiry: vehicle.TAX_EXPIRY,         icon: Receipt,   label: "Road Tax" },
              { type: "Road Permit", expiry: vehicle.ROAD_PERMIT_EXPIRY, icon: FileCheck, label: "Road Permit" },
              { type: "Pollution",   expiry: vehicle.POLLUTION_EXPIRY,   icon: Leaf,      label: "Pollution (PUC)" },
              { type: "FC",          expiry: vehicle.FC_EXPIRY,          icon: Car,       label: "Fitness Cert." },
            ];

            const alerts: DocAlert[] = docChecks
              .filter(d => d.expiry && d.expiry <= thirtyDaysFromNow)
              .map(d => {
                const isExpired = (d.expiry as Date) < now;
                const daysLeft = getDaysLeft(d.expiry as Date);
                return {
                  type: d.label,
                  expiry: d.expiry as Date,
                  isExpired,
                  daysLeft,
                  icon: d.icon,
                  color: isExpired ? "#EF4444" : "#F59E0B",
                  bg:    isExpired ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                };
              });

            if (alerts.length === 0) return null;

            const hasExpired = alerts.some(a => a.isExpired);

            return (
              <div
                key={vehicle.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "#162033",
                  border: `1px solid ${hasExpired ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
                }}
              >
                {/* Vehicle header */}
                <div
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{
                    background: hasExpired ? "rgba(239,68,68,0.07)" : "rgba(245,158,11,0.06)",
                    borderBottom: `1px solid ${hasExpired ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)"}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{
                        background: hasExpired ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                      }}
                    >
                      <AlertTriangle
                        className="h-4 w-4"
                        style={{ color: hasExpired ? "#EF4444" : "#F59E0B" }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#F8FAFC" }}>
                        {vehicle.BUS_NUMBER}
                      </p>
                      <p className="text-[11px]" style={{ color: "#475569" }}>
                        {vehicle.MAKE} {vehicle.MODEL} — {alerts.length} document{alerts.length !== 1 ? "s" : ""} need attention
                      </p>
                    </div>
                  </div>
                  <Link href={`/documents/${vehicle.id}/edit`}>
                    <Button_>Update Docs</Button_>
                  </Link>
                </div>

                {/* Alert rows */}
                <div className="divide-y divide-white/5">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className="flex items-center gap-4 px-5 py-4">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: alert.bg }}
                      >
                        <alert.icon className="h-4 w-4" style={{ color: alert.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: "#CBD5E1" }}>
                          {alert.type}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                          {alert.isExpired
                            ? `Expired ${Math.abs(alert.daysLeft)} day${Math.abs(alert.daysLeft) !== 1 ? "s" : ""} ago`
                            : `Expires in ${alert.daysLeft} day${alert.daysLeft !== 1 ? "s" : ""}`
                          }
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className="text-sm font-bold"
                          style={{ color: alert.color }}
                        >
                          {formatDate(alert.expiry)}
                        </p>
                        <span
                          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                          style={{
                            background: alert.isExpired ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                            color: alert.color,
                          }}
                        >
                          {alert.isExpired ? "EXPIRED" : "EXPIRING SOON"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Inline tiny button to avoid importing Button (server component)
function Button_({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
      style={{
        background: "rgba(59,130,246,0.1)",
        color: "#3B82F6",
        border: "1px solid rgba(59,130,246,0.2)",
      }}
    >
      {children}
    </span>
  );
}
