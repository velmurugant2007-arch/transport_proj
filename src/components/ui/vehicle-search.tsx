"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bus, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  BUS_NUMBER: string;
  REGISTER_NUMBER?: string | null;
}

interface VehicleSearchProps {
  vehicles: Vehicle[];
  defaultValue?: string | string[];
  name?: string;
  placeholder?: string;
  multi?: boolean;
}

export function VehicleSearch({ 
  vehicles, 
  defaultValue, 
  name = "vehicleId", 
  placeholder = "Search Bus Number...",
  multi = false
}: VehicleSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const initialIds = Array.isArray(defaultValue) 
    ? defaultValue 
    : defaultValue ? [defaultValue] : [];
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedVehicles = vehicles.filter(v => selectedIds.includes(v.id));

  const filtered = vehicles.filter(v => 
    !selectedIds.includes(v.id) && (
      v.BUS_NUMBER.toLowerCase().includes(query.toLowerCase()) ||
      (v.REGISTER_NUMBER?.toLowerCase().includes(query.toLowerCase()) ?? false)
    )
  ).slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelect = (id: string) => {
    if (multi) {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setSelectedIds([id]);
      setIsOpen(false);
    }
    setQuery("");
  };

  const removeId = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  return (
    <div className="relative w-full space-y-3" ref={containerRef}>
      {selectedIds.map(id => (
        <input key={id} type="hidden" name={multi ? "vehicleIds" : name} value={id} />
      ))}
      
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {selectedVehicles.map(v => (
            <div key={v.id} className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full pl-3 pr-1 py-1">
              <span className="text-[11px] font-black text-primary uppercase tracking-tight">Bus {v.BUS_NUMBER}</span>
              <button 
                type="button"
                onClick={() => removeId(v.id)}
                className="p-1 hover:bg-primary/20 rounded-full transition-colors group"
              >
                <X size={12} className="text-primary/60 group-hover:text-primary" />
              </button>
            </div>
          ))}
          {multi && selectedIds.length > 1 && (
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
               Shared Charge
             </div>
          )}
        </div>
      )}

      <div className="relative group">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder={selectedIds.length > 0 ? "Add another bus..." : placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="input-lux pl-11 h-12 text-sm font-bold"
        />
        
        {isOpen && (query.length > 0 || filtered.length > 0) && (
          <div className="absolute z-50 w-full mt-2 bg-[#121418] border-2 border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200 max-h-[300px] overflow-y-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-white/20 font-bold uppercase tracking-widest text-[10px]">
                {query.length > 0 ? "No matches found" : "All assets selected"}
              </div>
            ) : (
              <div className="p-1.5">
                {filtered.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => toggleSelect(v.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Bus size={16} className="text-white/20 group-hover:text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-white group-hover:text-primary transition-colors">Bus {v.BUS_NUMBER}</p>
                        <p className="text-[10px] font-bold text-white/40">{v.REGISTER_NUMBER || "No Registration"}</p>
                      </div>
                    </div>
                    <Check size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
