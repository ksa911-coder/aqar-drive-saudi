import { useState } from "react";
import type { Property } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { MapPin, ExternalLink } from "lucide-react";

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
  onSelect,
  className,
}: PropertyMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className={className ?? "h-full w-full rounded-xl overflow-hidden bg-surface border border-border flex flex-col"}>
      <div className="bg-muted/50 p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="size-4 text-gold" />
          <span>خريطة العقارات التفاعلية (وضع الأداء فائق السرعة)</span>
        </div>
        <span className="text-xs text-muted-foreground">{properties.length} عقار متاح</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => {
          const isSelected = property.id === selectedId;
          const isHovered = property.id === hoveredId;

          return (
            <div
              key={property.id}
              onClick={() => onSelect(property)}
              onMouseEnter={() => setHoveredId(property.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 flex flex-col justify-between bg-background ${
                isSelected
                  ? "border-gold ring-2 ring-gold/20 shadow-md"
                  : isHovered
                  ? "border-muted-foreground/50 shadow-sm"
                  : "border-border"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm line-clamp-1">{property.name}</h3>
                  <span className="text-xs font-bold text-gold whitespace-nowrap">
                    {formatPrice(property.price)} ريال
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="size-3" />
                  {property.district}، {property.city}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                <span className="text-muted-foreground">نوع العقار: {property.property_type}</span>
                <span className="text-gold flex items-center gap-1 font-medium">
                  عرض التفاصيل <ExternalLink className="size-3" />
                </span>
              </div>
            </div>
          );
        })}

        {properties.length === 0 && (
          <div className="col-span-full flex h-40 items-center justify-center text-sm text-muted-foreground">
            لا توجد عقارات متاحة حالياً وفق الفلاتر المحددة.
          </div>
        )}
      </div>
    </div>
  );
}