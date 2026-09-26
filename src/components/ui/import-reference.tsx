"use client";

import { Info, CheckCircle2, AlertCircle, FileSpreadsheet, FileJson } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FIELD_MAPS } from "@/lib/importer/mappers";

interface ImportReferenceProps {
  module: keyof typeof FIELD_MAPS;
}

export function ImportReference({ module }: ImportReferenceProps) {
  const fields = FIELD_MAPS[module];
  
  const getRequiredFields = () => {
    switch(module) {
      case "vehicles": return ["number", "fuelType", "capacity"];
      case "students": return ["name", "registerNumber", "department"];
      case "fuel": return ["vehicleNumber", "date", "quantity", "cost", "startOdometer"];
      case "maintenance": return ["vehicleNumber", "date", "serviceType", "cost"];
      case "expenses": return ["type", "amount", "date"];
      case "routes": return ["name"];
      default: return [];
    }
  };

  const required = getRequiredFields();

  return (
    <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed border-2">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Info className="h-4 w-4" />
          <h4 className="text-sm">Expected Import Format</h4>
        </div>
        
        <p className="text-xs text-muted-foreground">
          For successful import, your file should ideally use the following column names. 
          The system will attempt to intelligently map variations, but using these exact names is recommended.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <h5 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Required Columns</h5>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(fields).filter(f => required.includes(f)).map(field => (
                <Badge key={field} variant="default" className="bg-blue-500/10 text-blue-600 border-blue-200 text-[10px] py-0 px-2">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {field}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Optional Columns</h5>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(fields).filter(f => !required.includes(f)).map(field => (
                <Badge key={field} variant="outline" className="text-muted-foreground border-slate-200 text-[10px] py-0 px-2">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <a 
            href={`/api/import/template?module=${module}&format=csv`} 
            className="flex items-center gap-2 text-[11px] font-medium text-blue-600 hover:underline"
          >
            <FileJson className="h-3.5 w-3.5" />
            Download Sample CSV
          </a>
          <a 
            href={`/api/import/template?module=${module}&format=xlsx`} 
            className="flex items-center gap-2 text-[11px] font-medium text-emerald-600 hover:underline"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Download Sample Excel
          </a>
        </div>

        <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 dark:text-amber-400">
            <strong>Pro Tip:</strong> Ensure relational fields (like vehicle numbers) exactly match existing records in the system to prevent unassigned values.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
