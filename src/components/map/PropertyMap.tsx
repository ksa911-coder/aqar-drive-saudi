import { useEffect, useRef, useState } from "react";
import type { Property } from "@/lib/types";

interface PropertyMapProps {
  properties: Property[];
  selectedId: string | null;
  focus: [number, number] | null;
  onSelect: (property: Property) => void;
  className?: string;
}

export default function PropertyMap({
  properties,
  selectedId,
  focus,
  onSelect,
  className,
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    // تحميل Leaflet ديناميكياً لتجنب تجميد خيط المتصفح الرئيسي
    import("leaflet").then((L) => {
      // التأكد من تحميل ملف الـ CSS الخاص بـ Leaflet ديناميكياً أيضاً
      import("leaflet/dist/leaflet.css");

      if (isCancelled || !containerRef.current) return;

      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: false,
        }).setView([24.7136, 46.6753], 6);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        setIsInitialized(true);
      }
    });

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
      }
    };
  }, []);

  // إدارة العلامات
  useEffect(() => {
    if (!isInitialized || !mapRef.current) return;
    
    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (!map) return;

      const currentMarkers = markersRef.current;
      const newPropertyIds = new Set(properties.map((p) => p.id));

      Object.keys(currentMarkers).forEach((id) => {
        if (!newPropertyIds.has(id)) {
          currentMarkers[id]?.remove();
          delete currentMarkers[id];
        }
      });

      properties.forEach((property) => {
        if (!property.lat || !property.lng) return;

        const isSelected = property.id === selectedId;
        const markerColor = isSelected ? "#c5a059" : "#2563eb";

        const existingMarker = currentMarkers[property.id];
        if (existingMarker) {
          const el = existingMarker.getElement();
          if (el) {
            const innerDiv = el.querySelector("div");
            if (innerDiv instanceof HTMLElement) {
              innerDiv.style.backgroundColor = markerColor;
            }
          }
        } else {
          const customIcon = L.divIcon({
            className: "leaflet-marker-reset",
            html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor: pointer;"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          const marker = L.marker([property.lat, property.lng], { icon: customIcon });
          marker.on("click", () => onSelect(property));
          marker.addTo(map);
          currentMarkers[property.id] = marker;
        }
      });
    });
  }, [properties, selectedId, onSelect, isInitialized]);

  // التركيز على العقار المحدد
  useEffect(() => {
    if (mapRef.current && focus) {
      mapRef.current.setView(focus, 15, { animate: true });
    }
  }, [focus]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-full w-full rounded-xl overflow-hidden"}
    />
  );
}