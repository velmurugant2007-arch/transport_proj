"use client";

import dynamic from "next/dynamic";

const RouteMapClient = dynamic(
  () => import("@/components/maps/RouteMapClient"),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full flex items-center justify-center"
        style={{ background: "rgba(8,9,12,0.95)" }}>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center animate-pulse"
            style={{ background: "rgba(244,180,0,0.1)", border: "2px solid rgba(244,180,0,0.3)" }}
          >
            <span className="text-3xl">🗺️</span>
          </div>
          <p className="text-sm font-black text-white/40 uppercase tracking-[0.2em]">Loading Route Map...</p>
          <p className="text-[10px] font-bold text-white/20 mt-1 uppercase tracking-widest">
            Initializing Leaflet Engine
          </p>
        </div>
      </div>
    )
  }
);

export default function MapWrapper({ routes }: { routes: any }) {
  return <RouteMapClient routes={routes} />;
}
