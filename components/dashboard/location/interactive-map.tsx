"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";

interface InteractiveMapProps {
  center: { lat: number; lon: number };
  competitors?: Array<{ name: string; lat: number; lon: number }>;
  alternatives?: Array<{
    name: string;
    estimatedScore: number;
    reason: string;
    distance: string;
    coordinates?: { lat: number; lon: number };
  }>;
  radius?: number;
  onPinDragEnd?: (lat: number, lon: number) => void;
  mapStyle?: "light" | "dark" | "satellite";
  showLayerToggle?: boolean;
}

// Load Leaflet dynamically from CDN to avoid Next.js SSR build errors
function loadLeaflet(callback: () => void) {
  if (typeof window === "undefined") return;
  if ((window as any).L) {
    callback();
    return;
  }

  // Load CSS
  const linkId = "leaflet-cdn-css";
  if (!document.getElementById(linkId)) {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }

  // Load JS
  const scriptId = "leaflet-cdn-js";
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => callback();
    document.body.appendChild(script);
  } else {
    const interval = setInterval(() => {
      if ((window as any).L) {
        clearInterval(interval);
        callback();
      }
    }, 100);
  }
}

export function InteractiveMap({
  center,
  competitors = [],
  alternatives = [],
  radius = 500,
  onPinDragEnd,
  mapStyle = "dark", // default to modern dark style
  showLayerToggle = true,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeStyle, setActiveStyle] = useState(mapStyle);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const competitorsGroupRef = useRef<any>(null);
  const alternativesGroupRef = useRef<any>(null);
  const isochronesGroupRef = useRef<any>(null);

  const tileUrls = {
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  // Sample points around a center to create a wavy/organic Isochrone polygon
  const getIsochroneCoords = (centerLat: number, centerLon: number, radiusM: number, seed = 0) => {
    const coords: [number, number][] = [];
    const earthRadius = 6378137; // in meters
    const steps = 24;
    for (let i = 0; i < steps; i++) {
      const angle = (i * (360 / steps) * Math.PI) / 180;
      // organic wave factor: base + sinusoidal noise
      const wave = 1 + 0.14 * Math.sin(angle * 5 + seed) + 0.06 * Math.cos(angle * 3 + seed * 1.5);
      const dist = radiusM * wave;

      const dLat = (dist * Math.cos(angle)) / earthRadius;
      const dLon = (dist * Math.sin(angle)) / (earthRadius * Math.cos((centerLat * Math.PI) / 180));

      const lat = centerLat + (dLat * 180) / Math.PI;
      const lon = centerLon + (dLon * 180) / Math.PI;
      coords.push([lat, lon]);
    }
    return coords;
  };

  // Load Leaflet
  useEffect(() => {
    loadLeaflet(() => {
      setMapLoaded(true);
    });
  }, []);

  // Initialize and Update Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // 1. Initialize Map instance
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([center.lat, center.lon], 15);

      tileLayerRef.current = L.tileLayer(tileUrls[activeStyle], {
        maxZoom: 20,
      }).addTo(mapInstanceRef.current);

      L.control.zoom({ position: "bottomright" }).addTo(mapInstanceRef.current);

      // Create layer groups
      competitorsGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      alternativesGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      isochronesGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView([center.lat, center.lon], 15);
    }

    const map = mapInstanceRef.current;

    // 2. Setup Center Marker (Draggable Shop Location)
    const shopIcon = L.divIcon({
      html: `<div class="relative flex items-center justify-center w-9 h-9">
               <div class="absolute w-9 h-9 bg-violet-600/30 rounded-full animate-ping"></div>
               <div class="absolute w-6 h-6 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-600/50">
                 <span class="text-xs">🏪</span>
               </div>
             </div>`,
      className: "custom-shop-icon",
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (centerMarkerRef.current) {
      centerMarkerRef.current.setLatLng([center.lat, center.lon]);
    } else {
      centerMarkerRef.current = L.marker([center.lat, center.lon], {
        icon: shopIcon,
        draggable: !!onPinDragEnd,
      }).addTo(map);

      centerMarkerRef.current.on("dragend", () => {
        const position = centerMarkerRef.current.getLatLng();
        if (onPinDragEnd) {
          onPinDragEnd(position.lat, position.lng);
        }
      });
    }

    // 3. Draw Isochrone Catchment Areas (5 min & 10 min walks)
    isochronesGroupRef.current.clearLayers();

    // 10 min walk (outer, yellow/amber)
    const outerRadius = radius * 1.5;
    const outerIsochrone = L.polygon(getIsochroneCoords(center.lat, center.lon, outerRadius, 2.3), {
      color: "#f59e0b",
      fillColor: "#f59e0b",
      fillOpacity: activeStyle === "dark" ? 0.05 : 0.07,
      weight: 1.5,
      dashArray: "3, 6",
    });
    outerIsochrone.bindTooltip("حدود ۱۰ دقیقه پیاده‌روی", { sticky: true, className: "tooltip-custom" });
    isochronesGroupRef.current.addLayer(outerIsochrone);

    // 5 min walk (inner, emerald)
    const innerRadius = radius * 0.75;
    const innerIsochrone = L.polygon(getIsochroneCoords(center.lat, center.lon, innerRadius, 1.1), {
      color: "#10b981",
      fillColor: "#10b981",
      fillOpacity: activeStyle === "dark" ? 0.09 : 0.12,
      weight: 1.5,
      dashArray: "3, 6",
    });
    innerIsochrone.bindTooltip("حدود ۵ دقیقه پیاده‌روی (پاخور اصلی)", { sticky: true, className: "tooltip-custom" });
    isochronesGroupRef.current.addLayer(innerIsochrone);

    // 4. Competitor Markers
    competitorsGroupRef.current.clearLayers();
    const competitorIcon = L.divIcon({
      html: `<div class="relative flex items-center justify-center w-6 h-6">
               <div class="w-3.5 h-3.5 bg-rose-500 border border-white rounded-full shadow-md shadow-rose-500/40"></div>
             </div>`,
      className: "custom-competitor-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    competitors.forEach((c) => {
      if (c.lat && c.lon) {
        const marker = L.marker([c.lat, c.lon], { icon: competitorIcon });
        marker.bindPopup(`
          <div class="p-2 text-right dir-rtl font-sans text-xs bg-slate-950/90 text-white rounded-lg max-w-[180px] border border-white/10">
            <strong class="text-rose-400 block mb-0.5">${c.name}</strong>
            <span class="text-muted-foreground text-[10px] block">رقیب تجاری محلی</span>
          </div>
        `, { closeButton: false });
        competitorsGroupRef.current.addLayer(marker);
      }
    });

    // 5. Alternative Location Markers
    alternativesGroupRef.current.clearLayers();
    const alternativeIcon = L.divIcon({
      html: `<div class="relative flex items-center justify-center w-7 h-7">
               <div class="absolute w-7 h-7 bg-emerald-500/20 rounded-full animate-pulse"></div>
               <div class="absolute w-4 h-4 bg-emerald-500 border border-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
                 <span class="text-[9px] text-white">✨</span>
               </div>
             </div>`,
      className: "custom-alternative-icon",
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    alternatives.forEach((alt) => {
      let coords = alt.coordinates;
      // Mock coordinates nearby if AI hasn't returned them
      if (!coords) {
        const randOffset = () => (Math.random() - 0.5) * 0.012; // roughly 1-1.5km
        coords = { lat: center.lat + randOffset(), lon: center.lon + randOffset() };
      }

      if (coords.lat && coords.lon) {
        const marker = L.marker([coords.lat, coords.lon], { icon: alternativeIcon });
        marker.bindPopup(`
          <div class="p-2.5 text-right dir-rtl font-sans text-xs bg-slate-950/95 text-white rounded-lg max-w-[200px] border border-emerald-500/30">
            <strong class="text-emerald-400 block mb-1">لوکیشن پیشنهادی جایگزین</strong>
            <div class="text-[10px] text-white font-bold mb-1">${alt.name}</div>
            <div class="text-[9px] text-muted-foreground leading-relaxed">${alt.reason}</div>
            <div class="flex items-center justify-between mt-2 pt-1 border-t border-white/10">
              <span class="text-[9px] text-indigo-300">امتیاز تخمینی: ${alt.estimatedScore}/۱۰</span>
              <span class="text-[9px] text-emerald-400">${alt.distance}</span>
            </div>
          </div>
        `, { closeButton: false });
        alternativesGroupRef.current.addLayer(marker);
      }
    });

  }, [mapLoaded, center, competitors, alternatives, radius, onPinDragEnd, activeStyle]);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !tileLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(tileUrls[activeStyle], { maxZoom: 20 }).addTo(
      mapInstanceRef.current
    );
  }, [activeStyle, mapLoaded]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        centerMarkerRef.current = null;
        competitorsGroupRef.current = null;
        alternativesGroupRef.current = null;
        isochronesGroupRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950/40 backdrop-blur-md shadow-2xl">
      {!mapLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-xs text-muted-foreground">در حال آماده‌سازی نقشه تعاملی نشان...</span>
        </div>
      )}

      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-0" />

      {/* Floating Instructions */}
      {onPinDragEnd && (
        <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5 shadow-md pointer-events-none">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground dir-rtl font-medium">
            <Navigation size={12} className="text-indigo-400 rotate-45" />
            <span>پین را در محله مد نظر جابجا کنید.</span>
          </div>
        </div>
      )}

      {showLayerToggle && (
        <div className="absolute top-4 right-4 z-[400] flex gap-1">
          {(["light", "dark", "satellite"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveStyle(s)}
              className={`text-[9px] px-2 py-1 rounded-md border transition-all ${
                activeStyle === s
                  ? "bg-indigo-600/20 border-indigo-500/40 text-white font-bold"
                  : "bg-slate-900/80 border-white/5 text-muted-foreground hover:bg-slate-900"
              }`}
            >
              {s === "light" ? "روشن" : s === "dark" ? "تیره" : "ماهواره"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
