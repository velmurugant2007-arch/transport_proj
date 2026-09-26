"use client";

import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

interface ChartData {
  day: string;
  cost: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg px-3 py-2.5 text-xs"
        style={{
          background: "#0F172A",
          border: "1px solid rgba(59,130,246,0.25)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
        }}
      >
        <p style={{ color: "#94A3B8" }}>Day {label}</p>
        <p className="font-semibold mt-0.5" style={{ color: "#3B82F6" }}>
          ₹{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function FuelChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div
        className="h-full w-full flex flex-col items-center justify-center gap-3 rounded-lg"
        style={{ border: "1px dashed rgba(148,163,184,0.12)" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(59,130,246,0.08)" }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        </div>
        <p className="text-xs" style={{ color: "#475569" }}>No fuel data for this month yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.07)" />
        <XAxis
          dataKey="day"
          stroke="rgba(148,163,184,0.2)"
          tick={{ fill: "#475569", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="rgba(148,163,184,0.2)"
          tick={{ fill: "#475569", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₹${v}`}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cost"
          stroke="#3B82F6"
          strokeWidth={2.5}
          fill="url(#fuelGradient)"
          dot={{ r: 3, fill: "#3B82F6", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#3B82F6", stroke: "rgba(59,130,246,0.3)", strokeWidth: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
