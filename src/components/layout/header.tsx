"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Bell, Search, LogOut, ChevronDown, Zap, X, User, ShieldCheck, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "/dashboard":     { title: "Dashboard",            sub: "Transport overview" },
  "/vehicles":      { title: "Bus Management",       sub: "Vehicle management & status" },
  "/documents":     { title: "Document Management",  sub: "Vehicle Documents" },
  "/routes":        { title: "Route Management",     sub: "Manage Routes and Boarding Points" },
  "/route-map":     { title: "Route Map",            sub: "Interactive transport visualization" },
  "/students":      { title: "Students",             sub: "Passenger directory" },
  "/fuel":          { title: "Fuel Analytics",       sub: "Consumption monitoring" },
  "/maintenance":   { title: "Maintenance Records",  sub: "Vehicle Service and Repairs" },
  "/expenses":      { title: "Expense Management",   sub: "Track Vehicle Expenses" },
  "/notifications": { title: "System Alerts",        sub: "Critical event log" },
  "/settings":      { title: "Platform Config",      sub: "System parameters" },
};

const QUICK_LINKS = [
  { label: "Dashboard",     href: "/dashboard" },
  { label: "Buses",         href: "/vehicles" },
  { label: "Documents",     href: "/documents" },
  { label: "Routes",        href: "/routes" },
  { label: "Route Map",     href: "/route-map" },
  { label: "Students",      href: "/students" },
  { label: "Fuel Logs",     href: "/fuel" },
  { label: "Maintenance",   href: "/maintenance" },
  { label: "Expenses",      href: "/expenses" },
];

function getPage(pathname: string) {
  for (const [prefix, val] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return val;
  }
  return { title: "PSNA Transport", sub: "Fleet Operations Hub" };
}

export function Header() {
  const pathname         = usePathname();
  const router           = useRouter();
  const { data }         = useSession();
  const page             = getPage(pathname);
  const [drop, setDrop]  = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  const filtered = QUICK_LINKS.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)" }}
          onClick={() => { setSearchOpen(false); setQuery(""); }}
        >
          <div
            className="w-full max-w-xl rounded-24 overflow-hidden animate-in zoom-in-95 duration-200"
            style={{
              background: "rgba(20,22,26,0.92)",
              border: "2px solid rgba(244,180,0,0.4)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(244,180,0,0.1) inset",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 px-7 py-5 border-b border-white/10">
              <Search className="h-6 w-6 shrink-0 text-primary" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered.length > 0) {
                    router.push(filtered[0].href);
                    setSearchOpen(false);
                    setQuery("");
                  }
                }}
                placeholder="Search PSNA transport systems..."
                className="flex-1 bg-transparent outline-none text-lg font-semibold placeholder:text-white/20"
                style={{ color:"#FFFFFF" }}
              />
              <button onClick={() => { setSearchOpen(false); setQuery(""); }} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                <X className="h-5 w-5 text-white/30" />
              </button>
            </div>

            <div className="py-3 max-h-[450px] overflow-y-auto custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/30 text-sm font-bold tracking-tight">No results for &quot;{query}&quot;</p>
                </div>
              ) : (
                filtered.map((link) => (
                  <button
                    key={link.href}
                    className="w-full flex items-center gap-5 px-7 py-4 text-left transition-all hover:bg-primary/10 hover:text-primary group"
                    onClick={() => {
                      router.push(link.href);
                      setSearchOpen(false);
                      setQuery("");
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10 group-hover:bg-primary transition-all group-hover:shadow-[0_0_8px_#F4B400]" />
                    <span className="text-[15px] font-bold tracking-tight">{link.label}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <header className="glass-topbar flex items-center justify-between px-4 md:px-10 h-[80px] sticky top-0 z-[40]">
        {/* Left Identity Context */}
        <div className="flex items-center gap-3 md:gap-5">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors">
                <Menu className="h-6 w-6 text-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-transparent border-none w-[260px]">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <div className="flex flex-col">
            <h2 className="text-[16px] md:text-[19px] font-black text-white tracking-tight leading-tight">
              {page.title}
            </h2>
            <p className="text-[11px] font-bold text-white/40 tracking-[0.05em] uppercase mt-1">
              {page.sub}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 ml-4 animate-pulse">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black tracking-widest text-primary uppercase">System Active</span>
          </div>
        </div>

        {/* Right Interactions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden lg:flex items-center gap-4 px-5 h-11 rounded-16 cursor-pointer transition-all bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/10 group shadow-lg"
            style={{ minWidth: "260px" }}
          >
            <Search className="h-4.5 w-4.5 shrink-0 text-white/30 group-hover:text-primary transition-colors" />
            <span className="text-[13px] font-bold text-white/30 group-hover:text-white/60 transition-colors">Search anything...</span>
            <div className="ml-auto flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-white/10 text-white/30 tracking-tighter">
              <span className="text-[8px]">⌘</span>K
            </div>
          </button>

          <Link
            href="/notifications"
            className="relative w-11 h-11 rounded-16 flex items-center justify-center transition-all duration-300 bg-white/5 border-2 border-primary/40 hover:bg-primary/10 hover:border-primary group shadow-lg"
          >
            <Bell className="h-5 w-5 text-white/30 group-hover:text-primary transition-all" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary border-2 border-[#080809] shadow-[0_0_10px_#F4B400]" />
          </Link>

          <div className="h-9 w-[1px] bg-white/10 mx-2" />

          <div className="relative">
            <button
              onClick={() => setDrop(!drop)}
              className={cn(
                "flex items-center gap-3 pl-2.5 pr-4 py-2 rounded-16 transition-all duration-300 shadow-lg",
                drop ? "bg-primary/20 border-primary/40" : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <User className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[13px] font-black text-white leading-none tracking-tight">
                  {data?.user?.name ?? "Administrator"}
                </p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1.5">System Admin</p>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-white/30 transition-transform duration-300", drop && "rotate-180")} />
            </button>

            {drop && (
              <div
                className="absolute right-0 top-full mt-4 w-64 rounded-24 overflow-hidden z-50 animate-in slide-in-from-top-3 duration-200"
                style={{
                  background:"rgba(18,20,24,0.96)",
                  backdropFilter:"blur(32px)",
                  border:"2px solid rgba(244,180,0,0.4)",
                  boxShadow:"0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(244,180,0,0.1) inset",
                }}
              >
                <div className="px-6 py-5 border-b border-white/5 bg-white/2">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <p className="text-[14px] font-black text-white tracking-tight">
                      {data?.user?.name ?? "Administrator"}
                    </p>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => signOut({ callbackUrl:"/login" })}
                    className="w-full flex items-center gap-3.5 px-4.5 py-3.5 text-[13px] font-black transition-all duration-200 rounded-16 text-rose-500 hover:bg-rose-500/10 active:scale-[0.98]"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
