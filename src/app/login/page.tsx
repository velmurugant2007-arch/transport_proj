"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusFront, Loader2, AlertCircle, ShieldCheck, Truck, Route, ChevronRight } from "lucide-react";

import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await signIn("credentials", {
        email:    formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid credentials. Access denied.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent">
      {/* Premium Cinematic Background Layer */}
      <div className="fixed inset-0 z-[-1]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ 
            backgroundImage: "url('/images/Loginpage.jpeg')",
            filter: "brightness(0.8) saturate(1.1) contrast(1.05)"
          }} 
        />
        {/* Lighter Overlay System */}
        <div className="absolute inset-0 bg-white/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      </div>

      {/* Floating high-end feature badges */}
      <div className="absolute top-10 left-10 hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 animate-in slide-in-from-left-4 duration-700">
        <div className="p-1.5 bg-primary/20 rounded-lg shadow-[0_0_15px_rgba(244,180,0,0.2)]">
          <Truck className="h-4 w-4 text-primary" />
        </div>
        <span className="text-[11px] font-black tracking-widest text-white/70 uppercase">Fleet Management</span>
      </div>
      
      <div className="absolute bottom-10 right-10 hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 animate-in slide-in-from-right-4 duration-700">
        <div className="p-1.5 bg-primary/20 rounded-lg shadow-[0_0_15px_rgba(244,180,0,0.2)]">
          <Route className="h-4 w-4 text-primary" />
        </div>
        <span className="text-[11px] font-black tracking-widest text-white/70 uppercase">Route Analytics</span>
      </div>

      <div className="relative w-full max-w-[420px] z-10">
        {/* Institutional Branding */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6 animate-in zoom-in-95 duration-500">
            <div className="w-22 h-22 rounded-[32px] flex items-center justify-center overflow-hidden"
              style={{
                background: "white",
                border: "2px solid rgba(244,180,0,0.6)",
                boxShadow: "0 0 50px rgba(244,180,0,0.3), 0 20px 40px rgba(0,0,0,0.6)",
              }}>
              <div className="relative w-18 h-18">
                <Image 
                  src="/images/psnalog.png" 
                  alt="PSNACET Logo" 
                  fill 
                  className="object-contain p-1.5"
                />
              </div>
            </div>
          </div>
          <h1 className="text-premium-display" style={{ fontSize: "2.5rem", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.04em", textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            PSNA<br/>
            <span className="text-[0.9rem] font-black tracking-[0.45em] text-primary uppercase drop-shadow-lg">Transport Management</span>
          </h1>
          <p className="text-[12px] font-black text-white/50 mt-3 uppercase tracking-[0.25em] drop-shadow-md">
            Institutional Operations Portal
          </p>
        </div>

        {/* Elite Light Glassmorphism Login Card */}
        <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "28px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          }}>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(244,180,0,0.5)]" />
              <h2 className="text-xl font-black text-white tracking-tight uppercase italic text-[14px] drop-shadow-md">Administrator Access</h2>
            </div>
            <p className="text-[11px] font-bold text-white uppercase tracking-widest drop-shadow-sm">Secure Admin Login</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-7 text-[11px] font-black uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-[10px] font-black text-white/80 tracking-[0.2em] uppercase ml-1 drop-shadow-sm">Command Email</Label>
              <Input
                id="email" name="email" type="email"
                placeholder="admin@psnacet.edu.in"
                required
                className="h-13 text-sm input-lux font-bold bg-white/20 border-white/40 placeholder:text-white/60"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-[10px] font-black text-white/80 tracking-[0.2em] uppercase ml-1 drop-shadow-sm">Security Signature</Label>
              <Input
                id="password" name="password" type="password"
                placeholder="••••••••"
                required
                className="h-13 text-sm input-lux font-bold bg-white/20 border-white/40 placeholder:text-white/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-yellow-premium h-13 text-[12px] font-black uppercase tracking-[0.2em] mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Verify Credentials <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Security Integrity Badge */}
          <div className="flex items-center gap-3 mt-10 px-4 py-3.5 rounded-2xl bg-white/[0.1] border border-white/20 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-primary drop-shadow-[0_0_8px_rgba(244,180,0,0.6)]" />
            <p className="text-[9px] font-black text-white/60 tracking-[0.1em] leading-none uppercase">
              End-to-End Encrypted · Restricted Institutional Node
            </p>
          </div>
        </div>

        <p suppressHydrationWarning className="text-center mt-10 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} PSNA College of Engineering & Technology
        </p>
      </div>
    </div>
  );
}
