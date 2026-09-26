/**
 * StatusBadge — Colored pill badge for status/type fields.
 * Replaces inline badge JSX repeated across all module tables.
 *
 * Usage:
 *   <StatusBadge status="ACTIVE" />
 *   <StatusBadge status="Diesel" variant="amber" />
 */

type BadgeVariant = "orange" | "green" | "blue" | "amber" | "red" | "slate" | "auto";

interface StatusBadgeProps {
  /** The text to display */
  status: string;
  /**
   * Color variant. Use "auto" to automatically pick a color
   * based on common status/type strings.
   */
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_STYLES: Record<Exclude<BadgeVariant, "auto">, React.CSSProperties> = {
  orange: { background:"rgba(255,122,26,0.15)", color:"#FF9A3D", border:"1px solid rgba(255,122,26,0.25)" },
  green:  { background:"rgba(34,197,94,0.12)",  color:"#4ADE80", border:"1px solid rgba(34,197,94,0.2)"  },
  blue:   { background:"rgba(59,130,246,0.12)", color:"#60A5FA", border:"1px solid rgba(59,130,246,0.2)" },
  amber:  { background:"rgba(245,158,11,0.12)", color:"#FCD34D", border:"1px solid rgba(245,158,11,0.2)" },
  red:    { background:"rgba(239,68,68,0.12)",  color:"#F87171", border:"1px solid rgba(239,68,68,0.2)"  },
  slate:  { background:"rgba(255,255,255,0.06)",color:"#94A3B8", border:"1px solid rgba(255,255,255,0.1)" },
};

const AUTO_MAP: Record<string, Exclude<BadgeVariant, "auto">> = {
  // Vehicle status
  ACTIVE:      "green",
  INACTIVE:    "slate",
  MAINTENANCE: "amber",
  // Fuel types
  Diesel:      "amber",
  Petrol:      "orange",
  CNG:         "blue",
  EV:          "green",
  // Generic
  Active:      "green",
  Inactive:    "slate",
};

function resolveVariant(status: string, variant: BadgeVariant): Exclude<BadgeVariant, "auto"> {
  if (variant !== "auto") return variant;
  return AUTO_MAP[status] ?? "slate";
}

import React from "react";

export function StatusBadge({ status, variant = "auto", className }: StatusBadgeProps) {
  const resolved = resolveVariant(status, variant);
  return (
    <span
      className={className}
      style={{
        ...VARIANT_STYLES[resolved],
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: "99px",
        letterSpacing: "0.03em",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}
