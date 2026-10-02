import { Loader2 } from "lucide-react";

export default function GlobalDashboardLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse font-bold tracking-widest text-sm uppercase">Loading secure data...</p>
    </div>
  );
}
