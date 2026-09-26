"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, Polyline, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LeafletInit from "./LeafletInit";
import { Search, Bus, MapPin, Filter, X, Navigation, Users, Fuel, Info } from "lucide-react";
import { getStopCoordinates, PSNACET_CENTER } from "@/lib/coordinates";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Stop {
  id: string; NAME: string; ORDER: number; TIMING: string | null;
  AMOUNT: number | null; LATITUDE: number | null; LONGITUDE: number | null;
  _count: { students: number };
}
interface Bus {
  id: string; BUS_NUMBER: string; DRIVER_NAME: string | null;
  DRIVER_PHONE: string | null; FUEL_TYPE: string; STATUS: string;
  CAPACITY: number; MAKE: string | null; MODEL: string | null;
  REGISTER_NUMBER: string | null; _count: { students: number };
}
interface Route {
  id: string; NAME: string; DESCRIPTION: string | null;
  DISTANCE: number | null; TIMING: string | null;
  stops: Stop[]; assignedBuses: Bus[];
  _count: { students: number; stops: number };
}

// ─── Route colours ───────────────────────────────────────────────────────────
const ROUTE_COLORS = [
  "#2DD4BF","#F4B400","#60A5FA","#A78BFA","#34D399",
  "#FB923C","#F472B6","#FACC15","#4ADE80","#38BDF8",
];

// ─── Bus icon (3D Isometric Premium) ───────────────────────────────────────────────
function makeBusIcon(color: string, isActive: boolean = true) {
  return L.divIcon({
    className: "premium-bus-marker",
    html: `
      <div style="width: 96px; height: 96px; position: relative; display: flex; align-items: center; justify-content: center;">
        <img src="/images/premium-bus.png" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 16px 32px rgba(0,0,0,0.6)); pointer-events: none;" />
        <div style="position: absolute; bottom: 20px; right: 20px; width: 14px; height: 14px; border-radius: 50%; background: ${isActive ? '#10b981' : '#f43f5e'}; border: 2px solid #121418; box-shadow: 0 0 16px ${isActive ? '#10b981' : '#f43f5e'}, 0 0 6px rgba(255,255,255,0.3);"></div>
      </div>
    `,
    iconSize: [96, 96],
    iconAnchor: [48, 48],
    popupAnchor: [0, -48],
  });
}

// ─── Stop icon (Small 3D Bus) ───────────────────────────────────────────────
function makeStopIcon(color: string) {
  return L.divIcon({
    className: "premium-stop-marker",
    html: `
      <div style="width: 72px; height: 72px; position: relative; display: flex; align-items: center; justify-content: center;">
        <img src="/images/premium-bus.png" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4)); opacity: 0.95;" />
        <div style="position: absolute; bottom: 10px; right: 10px; width: 10px; height: 10px; border-radius: 50%; background: ${color}; border: 1px solid #121418; box-shadow: 0 0 8px ${color};"></div>
      </div>
    `,
    iconSize: [72, 72],
    iconAnchor: [36, 36],
    popupAnchor: [0, -36],
  });
}

// ─── College icon (destination) ──────────────────────────────────────────────
function makeCollegeIcon() {
  return L.divIcon({
    className: "college-marker",
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div class="animate-ping" style="position: absolute; width: 100%; height: 100%; background: #F4B400; opacity: 0.3; border-radius: 50%;"></div>
        <div style="position: relative; width: 20px; height: 20px; background: #F4B400; border: 2px solid #121418; border-radius: 50%; box-shadow: 0 0 16px #F4B400, inset 0 0 4px rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 10px;">🎓</span>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

// ─── Custom Map Layers ───────────────────────────────────────────────────────
function MapLayers({ type }: { type: "map" | "satellite" }) {
  const map = useMap();
  useEffect(() => {
    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 });
    const google = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", { 
      maxZoom: 20, 
      attribution: "&copy; Google Maps" 
    });
    
    if (type === "satellite") {
      google.addTo(map);
      osm.remove();
    } else {
      osm.addTo(map);
      google.remove();
    }

    return () => {
      osm.remove();
      google.remove();
    };
  }, [map, type]);
  return null;
}

// ─── Fit map to bounds ───────────────────────────────────────────────────────
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [map, points]);
  return null;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RouteMapClient({ routes }: { routes: Route[] }) {
  const router = useRouter();
  const [search, setSearch]           = useState("");
  const [routeFilter, setRouteFilter] = useState("all");
  const [busFilter, setBusFilter]     = useState("all");
  const [sideOpen, setSideOpen]       = useState(true);
  const [mapType, setMapType]         = useState<"map" | "satellite">("satellite");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected]   = useState(false);
  const [showSequence, setShowSequence] = useState(false);
  const [selectedBus, setSelectedBus] = useState<{ bus: Bus, route: Route, stop: Stop } | null>(null);

  useEffect(() => {
    if (!selectedBus) {
      setShowSequence(false);
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, [selectedBus]);

  // Compute per-stop coordinates (DB override or place-name lookup)
  const routesWithCoords = useMemo(() =>
    routes.map((route, ri) => ({
      ...route,
      stops: route.stops.map((stop, si) => ({
        ...stop,
        resolvedLat: stop.LATITUDE ?? getStopCoordinates(stop.NAME, si, route.stops.length, ri).lat,
        resolvedLng: stop.LONGITUDE ?? getStopCoordinates(stop.NAME, si, route.stops.length, ri).lng,
      })),
    })),
  [routes]);

  // Filter
  const visibleRoutes = useMemo(() =>
    routesWithCoords.filter(r => {
      if (routeFilter !== "all" && r.id !== routeFilter) return false;
      if (busFilter !== "all" && !r.assignedBuses.some(b => b.id === busFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.NAME.toLowerCase().includes(q) ||
          r.stops.some(s => s.NAME.toLowerCase().includes(q)) ||
          r.assignedBuses.some(b => b.BUS_NUMBER.toLowerCase().includes(q))
        );
      }
      return true;
    }),
  [routesWithCoords, routeFilter, busFilter, search]);

  // All visible points for FitBounds
  const allPoints = useMemo(() => {
    const pts = visibleRoutes.flatMap(r => r.stops.map(s => [s.resolvedLat, s.resolvedLng] as [number,number]));
    if (pts.length > 0) {
      pts.push([PSNACET_CENTER.lat, PSNACET_CENTER.lng]);
    }
    return pts;
  }, [visibleRoutes]);

  const allBuses = useMemo(() => {
    const seen = new Set<string>();
    return routes.flatMap(r => r.assignedBuses).filter(b => {
      if (seen.has(b.id)) return false; seen.add(b.id); return true;
    });
  }, [routes]);

  return (
    <div className="relative w-full h-full flex">
      <LeafletInit />

      {/* ── Side panel ── */}
      <div className={`relative z-[500] flex flex-col transition-all duration-300 ${sideOpen ? "w-[340px]" : "w-0 overflow-hidden"}`}
        style={{ background: "rgba(10,10,12,0.68)", backdropFilter: "blur(18px)", borderRight: "1px solid rgba(255,255,255,0.05)", boxShadow: "20px 0 40px rgba(0,0,0,0.4)" }}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Route Map</h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
              {visibleRoutes.length} routes · {allPoints.length} stops
            </p>
          </div>
          <button onClick={() => setSideOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search route, stop, bus..."
              className="w-full pl-9 pr-3 py-2.5 text-xs font-bold rounded-xl outline-none text-white placeholder:text-white/30"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(244,180,0,0.3)" }}
            />
          </div>

          {/* Route filter */}
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-3 text-primary" />
            <select value={routeFilter} onChange={e => setRouteFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs font-bold rounded-xl outline-none text-white appearance-none cursor-pointer"
              style={{ background:"rgba(244,180,0,0.12)", border:"1px solid rgba(244,180,0,0.4)" }}>
              <option value="all" className="bg-[#121418] text-white">All Routes</option>
              {routes.map(r => (
                <option key={r.id} value={r.id} className="bg-[#121418] text-white">{r.NAME}</option>
              ))}
            </select>
          </div>

          {/* Bus filter */}
          <div className="relative">
            <Bus size={13} className="absolute left-3 top-3 text-cyan-400" />
            <select value={busFilter} onChange={e => setBusFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs font-bold rounded-xl outline-none text-white appearance-none cursor-pointer"
              style={{ background:"rgba(45,212,191,0.1)", border:"1px solid rgba(45,212,191,0.35)" }}>
              <option value="all" className="bg-[#121418] text-white">All Buses</option>
              {allBuses.map(b => (
                <option key={b.id} value={b.id} className="bg-[#121418] text-white">{b.BUS_NUMBER}</option>
              ))}
            </select>
          </div>

          {/* Route legend */}
          <div className="pt-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">Route Legend</p>
            <div className="space-y-2">
              {routes.slice(0, 10).map((r, i) => (
                <button key={r.id} onClick={() => setRouteFilter(routeFilter === r.id ? "all" : r.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${routeFilter === r.id ? "bg-white/10 scale-[1.02]" : "hover:bg-white/5"}`}>
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-lg" style={{ background: ROUTE_COLORS[i % ROUTE_COLORS.length], boxShadow:`0 0 8px ${ROUTE_COLORS[i % ROUTE_COLORS.length]}` }} />
                  <span className="text-[11px] font-black text-white/80 truncate">{r.NAME}</span>
                  <span className="ml-auto text-[9px] font-black text-white/30">{r.stops.length}pts</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {[
              { label:"Routes", value: routes.length, icon: Navigation, color:"text-primary" },
              { label:"Buses",  value: allBuses.length, icon: Bus, color:"text-cyan-400" },
              { label:"Stops",  value: routes.reduce((s,r) => s+r.stops.length,0), icon: MapPin, color:"text-violet-400" },
              { label:"Students",value: routes.reduce((s,r) => s+r._count.students,0), icon: Users, color:"text-green-400" },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <item.icon size={12} className={`${item.color} mb-1`} />
                <p className="text-base font-black text-white">{item.value}</p>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legend bar */}
        <div className="p-3 border-t border-white/10 flex items-center gap-4 text-[9px] font-black text-white/40 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"/> Stop</span>
          <span className="flex items-center gap-1.5"><span className="text-base">🚌</span> Bus</span>
          <span className="flex items-center gap-1.5"><span className="w-6 h-px bg-primary inline-block"/> Route</span>
        </div>
      </div>

      {/* Toggle button when closed */}
      {!sideOpen && (
        <button onClick={() => setSideOpen(true)}
          className="absolute left-4 top-4 z-[600] flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105"
          style={{ background:"rgba(8,9,12,0.92)", border:"1px solid rgba(244,180,0,0.4)", color:"#F4B400", backdropFilter:"blur(16px)" }}>
          <Navigation size={14} /> Route Map
        </button>
      )}

      {/* ── Map ── */}
      <div className="flex-1 relative bg-black">
        <MapContainer
          center={[PSNACET_CENTER.lat, PSNACET_CENTER.lng]}
          zoom={12}
          style={{ height: "100%", width: "100%", background: "#000" }}
          zoomControl={false}
        >
          <MapLayers type={mapType} />

          {allPoints.length > 0 && <FitBounds points={allPoints} />}

          {visibleRoutes.map((route, ri) => {
            const color = ROUTE_COLORS[ri % ROUTE_COLORS.length];
            const linePoints: [number, number][] = route.stops.map(s => [s.resolvedLat, s.resolvedLng]);
            
            // Connect every route to the final destination (PSNA Campus)
            if (linePoints.length > 0) {
              linePoints.push([PSNACET_CENTER.lat, PSNACET_CENTER.lng]);
            }

            return (
              <div key={route.id}>
                {/* Route polyline - Clean White Style */}
                {linePoints.length >= 2 && (
                  <Polyline
                    positions={linePoints}
                    pathOptions={{ color: "white", weight: 2, opacity: 0.6, lineCap: "round", lineJoin: "round" }}
                  />
                )}

                {/* Stop markers */}
                {route.stops.map((stop) => (
                  <Marker
                    key={stop.id}
                    position={[stop.resolvedLat, stop.resolvedLng]}
                    icon={makeStopIcon(color)}
                      eventHandlers={{
                        click: () => {
                          const bus = route.assignedBuses[0] || { id: `placeholder-${route.id}`, BUS_NUMBER: "NOT ASSIGNED", STATUS: "INACTIVE", isPlaceholder: true };
                          setSelectedBus({ bus: bus as Bus, route, stop: stop as Stop });
                        }
                      }}
                    >
                      <Tooltip direction="right" offset={[14, 0]} opacity={1} className="bg-transparent border-none shadow-none p-0">
                      <div style={{ background: "rgba(18,20,24,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 10px", color: "white", display: "flex", flexDirection: "column", gap: "2px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700 }}>{stop.NAME}</span>
                        <div style={{ display: "flex", flexDirection: "column", opacity: 0.7, fontSize: "9px" }}>
                          <span>{stop.TIMING || "No Time"}</span>
                          <span>{stop._count.students} Students</span>
                        </div>
                      </div>
                    </Tooltip>
                    <Popup maxWidth={280}>
                      <div style={{ fontFamily:"system-ui", minWidth:"240px", background:"rgba(18,20,24,0.85)", backdropFilter:"blur(16px)", borderRadius:"16px", overflow:"hidden", border:`1px solid rgba(255,255,255,0.08)`, boxShadow:"0 20px 40px rgba(0,0,0,0.6)" }}>
                        <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:"12px", borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                          <div style={{ width:12, height:12, borderRadius:"50%", background:color, boxShadow:`0 0 12px ${color}` }}></div>
                          <div>
                            <strong style={{ color:"#fff", fontSize:15, fontWeight:800, letterSpacing:"-0.02em" }}>{stop.NAME}</strong>
                            <p style={{ color:"#ffffff60", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", margin:"2px 0 0 0" }}>Boarding Point #{stop.ORDER + 1}</p>
                          </div>
                        </div>
                        <div style={{ padding:"16px 20px", display:"grid", gap:12 }}>
                          <Row label="Route"    value={route.NAME}                />
                          <Row label="Students" value={`${stop._count.students}`} />
                          <Row label="Pickup"   value={stop.TIMING ?? "—"}        />
                          <Row label="Fee"      value={stop.AMOUNT ? `₹${stop.AMOUNT}` : "—"} />
                          {route.assignedBuses.length > 0 && (
                            <Row label="Bus" value={route.assignedBuses.map(b=>b.BUS_NUMBER).join(", ")} />
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Route markers are now all bus symbols as requested */}
              </div>
            );
          })}

          {/* Central College Destination Marker */}
          <Marker position={[PSNACET_CENTER.lat, PSNACET_CENTER.lng]} icon={makeCollegeIcon()}>
            <Tooltip direction="right" offset={[18, 0]} opacity={1} className="bg-transparent border-none shadow-none p-0">
              <div style={{ background: "rgba(18,20,24,0.95)", border: "1px solid rgba(244,180,0,0.4)", borderRadius: "8px", padding: "6px 10px", color: "white", display: "flex", flexDirection: "column", gap: "2px", boxShadow: "0 4px 12px rgba(244,180,0,0.2)" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#F4B400" }}>PSNA Campus</span>
                <span style={{ opacity: 0.7, fontSize: "9px" }}>Destination</span>
              </div>
            </Tooltip>
          </Marker>
        </MapContainer>

        {/* Cinematic map overlay vignette */}
        <div className="absolute inset-0 z-[400] pointer-events-none"
          style={{ background: "radial-gradient(circle at center, transparent 40%, rgba(5,6,8,0.6) 100%)" }} />

        {/* Map attribution overlay */}
        <div className="absolute bottom-4 right-4 z-[500]"
          style={{ background:"rgba(10,10,12,0.68)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:8, padding:"6px 10px", backdropFilter:"blur(12px)" }}>
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">© Google Maps · OpenStreetMap</p>
        </div>

        {/* Map Type Toggle (Top Left) */}
        <div className="absolute left-6 top-6 z-[600] flex bg-[#121418]/90 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-2xl">
          <button 
            onClick={() => setMapType("map")}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mapType === "map" ? "bg-primary text-black shadow-lg" : "text-white/40 hover:text-white"}`}
          >
            Map
          </button>
          <button 
            onClick={() => setMapType("satellite")}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mapType === "satellite" ? "bg-primary text-black shadow-lg" : "text-white/40 hover:text-white"}`}
          >
            Satellite
          </button>
        </div>

        {/* Bottom Navigation Pills */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[600] flex items-center gap-2 bg-[#121418]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {[
            { id: "home",   icon: Navigation, label: "Home",   action: () => router.push("/dashboard") },
            { id: "routes", icon: Filter,     label: "Routes", action: () => router.push("/routes") },
            { id: "buses",  icon: Bus,        label: "Buses",  action: () => router.push("/vehicles") },
            { id: "stops",  icon: MapPin,     label: "Stops",  action: () => router.push("/students") },
            { id: "layers", icon: Fuel,       label: "Layers", action: () => setMapType(mapType === "satellite" ? "map" : "satellite") },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={item.action}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${item.id === "home" ? "bg-primary/10 text-primary border border-primary/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}
            >
              <item.icon size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {visibleRoutes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-[400] pointer-events-none">
            <div className="text-center" style={{ background:"rgba(8,9,12,0.9)", border:"1px solid rgba(244,180,0,0.3)", borderRadius:20, padding:"40px 60px", backdropFilter:"blur(16px)" }}>
              <Info size={36} className="text-primary/30 mx-auto mb-3" />
              <p className="text-sm font-black text-white/40 uppercase tracking-widest">No Routes Match Filter</p>
              <p className="text-[10px] font-bold text-white/20 mt-1">Try adjusting your search or filter</p>
            </div>
          </div>
        )}

        {/* Bus Side Panel */}
        {selectedBus && (
          <div className="absolute right-6 top-6 bottom-6 z-[600] w-[380px] shadow-2xl transition-all duration-500 transform translate-x-0 overflow-hidden flex flex-col"
               style={{ fontFamily:"system-ui", background:"rgba(12,14,18,0.88)", backdropFilter:"blur(32px)", borderRadius:"32px", border:`1px solid rgba(255,255,255,0.12)`, boxShadow:"0 40px 100px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.05)" }}>
            
            {/* Header Image with fixed alignment */}
            <div className="h-[240px] relative shrink-0 bg-[#0c0e12] flex items-center justify-center overflow-hidden">
              <img 
                src="/images/psnacet-bus.png" 
                alt="Bus Preview" 
                className="w-full h-full object-cover relative z-10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-transparent to-transparent z-20" />
              
              <button 
                onClick={() => setSelectedBus(null)} 
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-all border border-white/10 z-30"
              >
                <X size={20} />
              </button>
              
              <div className="absolute bottom-6 left-8 right-8 z-30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-black text-primary uppercase tracking-[0.15em]">
                    Active Route
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {selectedBus.bus.STATUS}
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-white text-3xl font-black tracking-tighter m-0">{selectedBus.bus.BUS_NUMBER}</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Fleet Unit</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">
              {showSequence ? (
                <div className="grid gap-6 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Route Sequence</h4>
                    <button onClick={() => setShowSequence(false)} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Back to Details</button>
                  </div>
                  <div className="space-y-4 relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-white/5" />
                    {selectedBus.route.stops.sort((a,b) => a.ORDER - b.ORDER).map((s, i) => (
                      <div key={s.id} className="flex items-start gap-4 relative">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${s.id === selectedBus.stop.id ? 'bg-primary border-primary shadow-[0_0_12px_#F4B400]' : 'bg-[#0c0e12] border-white/10'}`}>
                          <span className={`text-[10px] font-black ${s.id === selectedBus.stop.id ? 'text-black' : 'text-white/40'}`}>{i + 1}</span>
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${s.id === selectedBus.stop.id ? 'text-white' : 'text-white/60'}`}>{s.NAME}</p>
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">{s.TIMING || "No Time Set"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-8">
                  <section>
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] mb-5">Primary Details</h4>
                    <div className="grid gap-5">
                      <Row label="Bus Number"       value={selectedBus.bus.BUS_NUMBER} color="#F4B400" />
                      <Row label="Route Assignment" value={selectedBus.route.NAME} />
                      <Row label="Driver Identity"   value={selectedBus.bus.DRIVER_NAME ?? "Unassigned"} />
                    </div>
                  </section>

                  <section>
                    <button 
                      onClick={() => setShowSequence(true)}
                      className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 relative overflow-hidden group text-left hover:bg-white/[0.06] transition-all"
                    >
                      <div className="absolute top-0 right-0 p-3 text-white/10 group-hover:text-primary/20 transition-colors">
                        <Navigation size={48} strokeWidth={1} />
                      </div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Route</p>
                      <p className="text-sm font-bold text-white">Full Stop Sequence</p>
                      <p className="text-[11px] font-bold text-primary mt-3 flex items-center gap-2">
                        View boarding points <Navigation size={12} />
                      </p>
                    </button>
                  </section>

                  <div className="h-px bg-white/5" />

                  <section>
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] mb-5">Operational Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Metric label="Capacity" value={selectedBus.bus.CAPACITY} sub="Seats" />
                      <Metric label="Boarded"  value={selectedBus.bus._count.students} sub="Students" />
                      <Metric label="Available" value={Math.max(0, selectedBus.bus.CAPACITY - selectedBus.bus._count.students)} sub="Seats" />
                      <Metric label="Fuel"     value={selectedBus.bus.FUEL_TYPE} sub="Diesel" />
                    </div>
                  </section>
                </div>
              )}
            </div>

            <div className="p-8 pt-0 mt-auto">
              <button 
                disabled={isConnecting}
                onClick={() => {
                  if (isConnected) return;
                  setIsConnecting(true);
                  setTimeout(() => {
                    setIsConnecting(false);
                    setIsConnected(true);
                  }, 2500);
                }}
                className={`w-full py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-center gap-3 ${isConnecting ? 'bg-emerald-500 text-white animate-pulse' : isConnected ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-primary text-black hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {isConnecting ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                    Establishing Link...
                  </>
                ) : isConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    Live Comms Active
                  </>
                ) : (
                  "Initialize Live Comms"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Small popup row helper
function Row({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] font-black text-white/30 uppercase tracking-widest">{label}</span>
      <span className="text-[13px] font-bold text-white text-right" style={{ color }}>{value}</span>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  const isLong = String(value).length > 8;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/[0.04] flex flex-col justify-center min-h-[70px]">
      <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1.5">{label}</p>
      <div className="flex items-baseline gap-1.5 overflow-hidden">
        <span className={`${isLong ? 'text-[11px]' : 'text-xl'} font-black text-white leading-tight truncate`} title={String(value)}>
          {value}
        </span>
        <span className="text-[9px] font-bold text-white/30 shrink-0">{sub}</span>
      </div>
    </div>
  );
}
