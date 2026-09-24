import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { SAUDI_CENTER, STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from "@/lib/constants";
import { formatNumber, formatPrice } from "@/lib/format";
import type { Property } from "@/lib/types";

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<span class="aqar-pin" style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target && map) {
      try {
        map.flyTo(target, 14, { duration: 0.8 });
      } catch (e) {
        console.error(e);
      }
    }
  }, [target, map]);
  return null;
}

function ClickPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface Props {
  properties: Property[];
  selectedId?: string | null;
  focus?: [number, number] | null;
  onSelect?: (p: Property) => void;
  pickMode?: boolean;
  pickedPoint?: [number, number] | null;
  onPick?: (lat: number, lng: number) => void;
  className?: string;
}

export default function PropertyMap({
  properties,
  selectedId,
  focus,
  onSelect,
  pickMode,
  pickedPoint,
  onPick,
  className,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <MapContainer
      center={SAUDI_CENTER}
      zoom={6}
      scrollWheelZoom={true}
      className={className ?? "h-full w-full"}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo target={focus ?? null} />
      {pickMode && onPick && <ClickPicker onPick={onPick} />}
      {pickedPoint && (
        <Marker position={pickedPoint} icon={pinIcon("#A9782E")}>
          <Popup>موقع العقار المحدد</Popup>
        </Marker>
      )}
      {properties
        .filter((p) => p.lat && p.lng)
        .map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={pinIcon(STATUS_COLORS[p.status] || "#A9782E")}
            eventHandlers={{ click: () => onSelect?.(p) }}
            opacity={selectedId && selectedId !== p.id ? 0.7 : 1}
          >
            <Popup>
              <div className="min-w-[210px] text-right space-y-1.5" dir="rtl">
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="mb-2 h-24 w-full rounded object-cover"
                  />
                )}
                <strong className="block text-sm font-bold text-slate-900">{p.name}</strong>
                
                <div className="text-xs text-slate-600 space-y-0.5 border-t border-b border-slate-100 py-1 my-1">
                  <span className="block">📍 {p.district}، {p.city} · {TYPE_LABELS[p.property_type] ?? "عقار"}</span>
                  {p.plot_number && <span className="block font-medium text-primary">رقم القطعة: {p.plot_number}</span>}
                  {p.street_name && <span className="block">الشارع: {p.street_name} {p.street_width ? `(عرضه: ${p.street_width}م)` : ""}</span>}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span>{p.beds > 0 ? `${formatNumber(p.beds)} غرف` : ""}</span>
                  <span>{formatNumber(p.area)} م²</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-slate-900">{formatPrice(p.price)} ريال</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100" style={{ color: STATUS_COLORS[p.status] }}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}