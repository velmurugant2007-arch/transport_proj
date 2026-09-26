/**
 * EmptyState — Empty table / list message component.
 * Replaces repeated "no records" JSX across all module pages.
 *
 * Usage:
 *   <EmptyState
 *     icon={<Fuel />}
 *     title="No Fuel Logs"
 *     description="Start by adding your first fuel log."
 *     action={<Link href="/fuel/new"><button>Add Fuel Log</button></Link>}
 *   />
 */

import React from "react";

interface EmptyStateProps {
  /** Icon element (Lucide icon recommended) */
  icon?: React.ReactNode;
  /** Main heading */
  title: string;
  /** Supporting description */
  description?: string;
  /** Optional call-to-action element */
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      style={{ minHeight: "200px" }}
    >
      {icon && (
        <div
          className="flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
          style={{
            background: "rgba(255,122,26,0.08)",
            border: "1px solid rgba(255,122,26,0.15)",
          }}
        >
          <span style={{ color: "#FF7A1A" }}>{icon}</span>
        </div>
      )}
      <p style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
        {title}
      </p>
      {description && (
        <p style={{ fontSize: "13px", color: "#7B8190", marginTop: "6px", maxWidth: "300px" }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: "16px" }}>{action}</div>}
    </div>
  );
}
