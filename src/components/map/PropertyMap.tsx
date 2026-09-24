import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // تهيئة الخريطة مرة واحدة فقط لمنع التعليق
    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([24.7136, 46.6753], 6); // افتراضي على الرياض

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // تحديث الموقع عند التركيز أو اختيار عقار
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