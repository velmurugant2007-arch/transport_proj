"use client";

import { useState, useCallback } from "react";
import { Upload, X, CheckCircle2, AlertCircle, Loader2, FileText, Table as TableIcon, Activity, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";

interface ImportZoneProps {
  onImport: (formData: FormData) => Promise<{ 
    success: boolean; 
    count?: number; 
    message?: string;
    errors?: { row: number; message: string }[];
  }>;
  label?: string;
  className?: string;
}

export function ImportZone({ onImport, label = "Import Data", className }: ImportZoneProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [result, setResult] = useState<{ count?: number; message?: string; errors?: any[] } | null>(null);
  const router = useRouter();

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    const validExts = [".csv", ".xlsx", ".xls"];
    if (droppedFile && validExts.some(ext => droppedFile.name.toLowerCase().endsWith(ext))) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await onImport(formData);
      setResult(response);
      setStatus(response.success ? "success" : "error");
      
      if (response.success) {
        // Trigger a router refresh to sync the UI with the latest database state
        router.refresh();
      }
    } catch (error) {
      setStatus("error");
      setResult({ message: "Import failed: Connection error during synchronization." });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <SheetTrigger
        render={
          <Button variant="outline" className={cn("h-10 gap-2 font-bold border-white/10 bg-white/5 hover:bg-white/10 rounded-12 transition-all", className)}>
            <Upload className="h-4 w-4 text-primary" strokeWidth={2.5} />
            {label}
          </Button>
        }
      />
      <SheetContent side="right" className="w-full sm:max-w-md h-full flex flex-col p-0 border-l border-white/10 bg-[#0c0d0f] text-white">
        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
          <SheetHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl">
                <TableIcon className="h-5 w-5 text-primary" />
              </div>
              <SheetTitle className="text-xl font-black tracking-tight text-white">Import Records</SheetTitle>
            </div>
            <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Quickly add multiple records by uploading a file.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {status === "idle" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-400 space-y-6">
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                  "relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-12 transition-all duration-300 cursor-pointer",
                  isDragging 
                    ? "border-primary bg-primary/10 scale-[0.98]" 
                    : "border-white/10 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.04]"
                )}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                />
                
                {file ? (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="p-4 bg-primary/10 rounded-2xl shadow-[0_0_30px_rgba(244,180,0,0.1)]">
                      <FileText className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-base text-white truncate max-w-[240px]">{file.name}</p>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">
                        {(file.size / 1024).toFixed(1)} KB · FILE READY FOR IMPORT
                      </p>
                    </div>
                    <Button variant="ghost" className="h-8 text-[10px] uppercase font-black tracking-widest text-white/40 hover:text-rose-400 hover:bg-rose-400/5 mt-2" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      <X className="h-3 w-3 mr-2" /> Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-5 text-center">
                    <div className="p-5 bg-white/5 rounded-full border border-white/5 shadow-inner">
                      <Upload className="h-8 w-8 text-white/20" />
                    </div>
                    <div>
                      <p className="font-black text-white/60 tracking-tight">Drop your file here</p>
                      <p className="text-[10px] text-white/20 font-black mt-2 uppercase tracking-widest">CSV, XLSX or XLS (LIMIT 10MB)</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[11px] text-white/60 leading-relaxed font-bold">
                  The system will process your data and match it with existing records. Please ensure your file follows the required format.
                </p>
              </div>
            </div>
          )}

          {status === "uploading" && (
            <div className="flex flex-col items-center justify-center py-20 gap-8 animate-in fade-in duration-500 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Loader2 className="h-14 w-14 text-primary animate-spin relative z-10" strokeWidth={1.5} />
                <Activity className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" />
              </div>
              <div className="space-y-2">
                <p className="font-black text-lg text-white tracking-tight">Importing Records</p>
                <p className="text-[11px] text-white/30 font-black uppercase tracking-widest">Processing file and validating data...</p>
              </div>
            </div>
          )}

          {(status === "success" || status === "error") && result && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={cn(
                "p-6 rounded-3xl flex items-start gap-4 border shadow-2xl",
                status === "success" ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" : "bg-rose-500/5 text-rose-400 border-rose-500/20"
              )}>
                <div className={cn(
                  "p-2 rounded-xl shrink-0 shadow-lg",
                  status === "success" ? "bg-emerald-500/20" : "bg-rose-500/20"
                )}>
                  {status === "success" ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-black text-base leading-none mb-2 uppercase tracking-tight">{status === "success" ? "Import Complete" : "Import Errors"}</p>
                  <p className="text-[11px] font-bold leading-normal opacity-70 uppercase tracking-wide">{result.message}</p>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/20 flex items-center gap-2 px-1">
                    <X className="h-3 w-3 text-rose-500" />
                    Error Report ({result.errors.length} issues)
                  </h3>
                  <div className="panel-lux overflow-hidden border-white/10">
                    <div className="max-h-[300px] overflow-auto scrollbar-thin">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead className="bg-white/5 border-b border-white/10 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 font-black text-white/30 uppercase tracking-widest">Row</th>
                            <th className="px-4 py-3 font-black text-white/30 uppercase tracking-widest">Detail</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {result.errors?.map((err, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 font-black text-white/20">{err?.row || idx + 1}</td>
                              <td className="px-4 py-3 text-rose-400 font-bold leading-relaxed">{err?.message || "Structural format mismatch"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {status === "success" && (
                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-emerald-400/80 font-bold uppercase tracking-tight leading-relaxed">
                    All records have been successfully added to the system.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 bg-white/[0.02] shrink-0 flex gap-4">
          <Button 
            variant="ghost" 
            className="flex-1 h-12 font-black text-[11px] uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-16 transition-all" 
            onClick={() => { setIsOpen(false); reset(); }}
          >
            Cancel
          </Button>
          
          {status === "idle" && file ? (
            <Button className="flex-1 h-12 btn-yellow-premium font-black text-[11px] uppercase tracking-widest gap-3 rounded-16 shadow-lg" onClick={handleUpload}>
              <TableIcon className="h-4 w-4" />
              Start Import
            </Button>
          ) : (status === "success" || status === "error") ? (
            <Button className="flex-1 h-12 btn-yellow-premium font-black text-[11px] uppercase tracking-widest rounded-16" onClick={reset}>
              Import Another File
            </Button>
          ) : (
            <Button className="flex-1 h-12 bg-white/10 text-white/20 font-black text-[11px] uppercase tracking-widest rounded-16 cursor-not-allowed" disabled>
              Processing...
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
