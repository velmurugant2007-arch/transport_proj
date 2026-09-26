"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportMenuProps {
  data: any[];
  filename: string;
  headers: string[];
  keys: string[];
  title: string;
}

export function ExportMenu({ data, filename, headers, keys, title }: ExportMenuProps) {
  const [loading, setLoading] = useState(false);

  const getValue = (row: any, key: string) => {
    // Handle nested keys like "vehicle.number"
    const val = key.split('.').reduce((obj, k) => obj?.[k], row);
    
    if (val === null || val === undefined) return "-";
    
    if (Array.isArray(val)) {
      return val.map(item => {
        if (typeof item === 'object') {
          return item.BUS_NUMBER || item.NAME || item.number || item.name || JSON.stringify(item);
        }
        return item;
      }).join(", ");
    }
    
    if (typeof val === "object") {
      return val.BUS_NUMBER || val.NAME || val.number || val.name || JSON.stringify(val);
    }
    
    if (val instanceof Date) return val.toLocaleDateString();
    
    return String(val);
  };

  const exportCSV = () => {
    const csvRows = [];
    csvRows.push(headers.join(","));
    
    for (const row of data) {
      const values = keys.map(key => {
        const val = getValue(row, key);
        const escaped = ("" + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape") as any;
    
    doc.setFontSize(18);
    doc.text(title, 14, 15);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableData = data.map(row => keys.map(key => getValue(row, key)));

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [244, 180, 0], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold h-10 px-5 rounded-14 transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px cursor-pointer">
        <Download className="h-4 w-4" /> Export Data <ChevronDown className="h-3 w-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#121418] border-white/10 min-w-[160px]">
        <DropdownMenuItem onClick={exportCSV} className="font-bold gap-3 cursor-pointer py-2.5">
          <FileSpreadsheet className="h-4 w-4 text-green-400" /> Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF} className="font-bold gap-3 cursor-pointer py-2.5">
          <FileText className="h-4 w-4 text-primary" /> Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
