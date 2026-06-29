"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

interface InteractiveMapProps {
  center: { lat: number; lon: number };
  competitors?: Array<{ name: string; lat: number; lon: number }>;
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
  radius = 500,
  onPinDragEnd,
  mapStyle = "light",
  showLayerToggle = false,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeStyle, setActiveStyle] = useState(mapStyle);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const competitorsGroupRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  const tileUrls = {
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
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

      // Create a layer group for competitor markers
      competitorsGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    } else {
      // If map is already initialized, pan to new center
      mapInstanceRef.current.setView([center.lat, center.lon], 15);
    }

    const map = mapInstanceRef.current;

    // 2. Setup Center Marker (Draggable Shop Location)
    const shopIcon = L.divIcon({
      html: `<div class="relative flex items-center justify-center w-8 h-8">
               <div class="absolute w-8 h-8 bg-violet-600/30 rounded-full animate-ping"></div>
               <div class="absolute w-5 h-5 bg-violet-500 border border-white rounded-full flex items-center justify-center shadow-lg shadow-violet-500/50">
                 <span class="text-[10px] text-white">📍</span>
               </div>
             </div>`,
      className: "custom-shop-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    if (centerMarkerRef.current) {
      centerMarkerRef.current.setLatLng([center.lat, center.lon]);
    } else {
      centerMarkerRef.current = L.marker([center.lat, center.lon], {
        icon: shopIcon,
        draggable: !!onPinDragEnd,
      }).addTo(map);

      // Handle Pin Dragging
      centerMarkerRef.current.on("dragend", () => {
        const position = centerMarkerRef.current.getLatLng();
        if (onPinDragEnd) {
          onPinDragEnd(position.lat, position.lng);
        }
      });
    }

    // 3. Draw Radius Circle
    if (circleRef.current) {
      circleRef.current.setLatLng([center.lat, center.lon]);
      circleRef.current.setRadius(radius);
    } else {
      circleRef.current = L.circle([center.lat, center.lon], {
        color: "#8b5cf6",
        fillColor: "#8b5cf6",
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: "4, 4"
      }).addTo(map);
    }

    // 4. Update Competitor Markers
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
          <div class="p-2 text-right dir-rtl font-sans text-xs bg-slate-900 text-white rounded-md max-w-[180px]">
            <strong class="text-rose-400 block mb-0.5">${c.name}</strong>
            <span class="text-muted-foreground text-[10px] block">رقیب تجاری محلی</span>
          </div>
        `, {
          className: "leaflet-popup-custom",
          closeButton: false
        });
        competitorsGroupRef.current.addLayer(marker);
      }
    });

  }, [mapLoaded, center, competitors, radius, onPinDragEnd]);

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
        circleRef.current = null;
        competitorsGroupRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950/40 backdrop-blur-md shadow-2xl">
      {!mapLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">در حال آماده‌سازی نقشه تعاملی...</span>
        </div>
      )}
      
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-0" />

      {/* Floating Instructions */}
      {onPinDragEnd && (
        <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5 shadow-md pointer-events-none">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground dir-rtl font-medium">
            <MapPin size={12} className="text-violet-500 animate-pulse" />
            <span>پین را بکشید — تحلیل با تأیید شما انجام می‌شود.</span>
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
              className={`text-[9px] px-2 py-1 rounded-md border ${
                activeStyle === s
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-slate-900/80 border-white/10 text-muted-foreground"
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
