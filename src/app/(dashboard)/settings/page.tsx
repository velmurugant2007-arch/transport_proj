"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate a save
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full page-enter pb-32">
      <div>
        <h1 className="text-display-lux text-3xl">System Configuration</h1>
        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">Platform Preferences & Alerts</p>
      </div>

      <div className="grid gap-8">
        <div className="panel-lux p-8 border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Switch className="scale-75" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Notification Controls</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Automated System Alerts</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-primary/20 transition-colors">
              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-black text-white group-hover:text-primary transition-colors">Maintenance Reminders</Label>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Notify when a vehicle is due for service</span>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-primary/20 transition-colors">
              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-black text-white group-hover:text-primary transition-colors">Fuel Threshold Warning</Label>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Alert when monthly fuel budget is exceeded</span>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-primary/20 transition-colors">
              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-black text-white group-hover:text-primary transition-colors">Document Expiry</Label>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Alert 30 days before insurance/permit expiry</span>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>
          </div>
        </div>

        <div className="panel-lux p-8 border-white/10 opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <div className="h-4 w-4 bg-white/20 rounded-sm" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Advanced Protocol</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Admin Level Configuration</p>
            </div>
          </div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center py-8">Cloud Synchronization Active • Settings Managed by System</p>
        </div>
      </div>
    </div>
  );
}
