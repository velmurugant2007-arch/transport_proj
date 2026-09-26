"use client";

import { useState } from "react";
import { Trash2, CheckSquare, ListChecks, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BulkDeleteToolbarProps {
  selectedCount: number;
  totalAvailable: number;
  onDelete: () => Promise<void>;
  onSelectAll: () => void;
  onSelectTop10: () => void;
  onClear: () => void;
}

export function BulkDeleteToolbar({
  selectedCount,
  totalAvailable,
  onDelete,
  onSelectAll,
  onSelectTop10,
  onClear
}: BulkDeleteToolbarProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Institutional Protocol: Permanently decommission ${selectedCount} records? This action is irreversible.`)) {
      setIsDeleting(true);
      await onDelete();
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div 
          initial={{ y: 100, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 100, x: "-50%", opacity: 0 }}
          className="fixed bottom-10 left-1/2 z-[999] w-fit min-w-[400px]"
        >
          <div className="relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative flex items-center gap-6 bg-[#0f1115]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-full px-6 py-3.5">
              <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                <div className="bg-primary text-black text-[10px] font-black rounded-lg px-2 py-1 flex items-center justify-center min-w-[24px]">
                  {selectedCount}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Selected</span>
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">Registry Units</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onSelectAll} 
                  className="h-9 px-4 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all gap-2 font-bold text-[11px] uppercase tracking-wider"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-primary" />
                  Select All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onSelectTop10} 
                  className="h-9 px-4 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all gap-2 font-bold text-[11px] uppercase tracking-wider"
                >
                  <ListChecks className="h-3.5 w-3.5 text-primary" />
                  Top 10
                </Button>
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClear} 
                  className="h-9 w-9 rounded-full hover:bg-rose-500/10 text-white/20 hover:text-rose-500 transition-all"
                >
                  <X size={16} />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete} 
                  disabled={isDeleting}
                  className="h-10 px-6 rounded-full gap-2 shadow-lg shadow-rose-500/20 font-black text-[11px] uppercase tracking-[0.1em] bg-rose-600 hover:bg-rose-500 transition-all active:scale-95"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Decommission {selectedCount}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
