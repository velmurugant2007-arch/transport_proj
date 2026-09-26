/**
 * PageHeader — Reusable page title + subtitle + optional action button.
 * Used at the top of every list/detail page.
 *
 * Usage:
 *   <PageHeader
 *     title="Fleet Management"
 *     subtitle="Manage all vehicles in your fleet"
 *     action={<Link href="/vehicles/new"><button>Add Vehicle</button></Link>}
 *   />
 */

import React from "react";

interface PageHeaderProps {
  /** Primary page title */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** Optional action element (button, link, etc.) placed on the right */
  action?: React.ReactNode;
  /** Optional badge / status element shown next to the title */
  badge?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action, badge }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <p
            className="text-[0.625rem] font-black tracking-[0.25em] text-white/20 uppercase mb-1"
          >
            PSNA TRANSPORT MANAGEMENT
          </p>
          <h1
            style={{
              fontSize: "1.625rem", fontWeight: 700,
              letterSpacing: "-0.03em", color: "#FFFFFF",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: "13px", color: "#7B8190", marginTop: "3px", fontWeight: 500 }}>
              {subtitle}
            </p>
          )}
        </div>
        {badge}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
