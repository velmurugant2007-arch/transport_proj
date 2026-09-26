"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BusFront, Map, Users, Fuel,
  Wrench, TrendingUp, Bell, Settings, ClipboardList,
  ShieldCheck, BookOpen, MapPinned
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const sections = [
  {
    label: "Operations",
    items: [
      { name: "Dashboard",        href: "/dashboard",   icon: LayoutDashboard, color: "#F4B400" },
      { name: "Students",         href: "/students",    icon: Users,           color: "#4ADE80" },
      { name: "Buses",            href: "/vehicles",    icon: BusFront,        color: "#4F8CFF" },
      { name: "Routes",           href: "/routes",      icon: Map,             color: "#2DD4BF" },
      { name: "Route Map",        href: "/route-map",   icon: MapPinned,       color: "#2DD4BF" },
      { name: "Documents",        href: "/documents",   icon: ClipboardList,   color: "#A78BFA" },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Fuel Logs",   href: "/fuel",        icon: Fuel,       color: "#F4B400" },
      { name: "Maintenance", href: "/maintenance", icon: Wrench,     color: "#F4B400" },
      { name: "Expenses",    href: "/expenses",    icon: TrendingUp, color: "#FF4B4B" },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Notifications", href: "/notifications", icon: Bell,     color: "#FF4B4B" },
      { name: "Settings",      href: "/settings",      icon: Settings, color: "#94A3B8" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[260px] h-full py-6 px-4 glass-sidebar relative z-50">
      {/* Brand Identity with Official Logo */}
      <div className="px-2 mb-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
             <div className="relative w-10 h-10">
                <Image 
                  src="/images/psnalog.png" 
                  alt="PSNACET Logo" 
                  fill 
                  className="object-contain p-0.5"
                />
             </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-premium-display leading-tight" style={{ fontWeight: 900, fontSize: "1rem", color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              PSNACET
            </h1>
            <p className="text-[0.65rem] font-bold tracking-[0.05em] text-white/40 uppercase">Transport Management</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#F4B400]" />
              <p className="text-[0.55rem] font-black tracking-widest text-white/80 uppercase">Main Menu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Ecosystem */}
      <nav className="flex flex-col flex-1 overflow-y-auto gap-1 pr-1 custom-scrollbar">
        {sections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="px-3 mb-2 text-[0.6rem] font-black tracking-[0.25em] text-white/30 uppercase">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-16 transition-all duration-300 mb-0.5",
                    isActive 
                      ? "nav-active-glass" 
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-8.5 h-8.5 flex items-center justify-center rounded-12 shrink-0 transition-all duration-300",
                    isActive ? "bg-primary/20 shadow-[0_0_15px_rgba(244,180,0,0.15)]" : "bg-white/5 group-hover:bg-white/10"
                  )}>
                    <item.icon className="h-4.5 w-4.5" style={{ color: isActive ? "#F4B400" : item.color }} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[14px] font-bold tracking-tight">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1 h-5 rounded-full bg-primary shadow-[0_0_12px_#F4B400]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Premium Admin Badge */}
      <div className="mt-auto px-1 pt-4">
        <div className="p-4 rounded-24 glass-card border-white/10 flex items-center gap-3 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-black text-white tracking-tight">Admin Console</p>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Verified Access</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
