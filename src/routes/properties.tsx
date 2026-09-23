import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ClientMap } from "@/components/map/ClientMap";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { StatusBadge } from "@/components/properties/StatusBadge";
import { AddPropertyDialog } from "@/components/properties/AddPropertyDialog";
import { RequestDialog } from "@/components/properties/RequestDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { usePublicProperties } from "@/lib/properties";
import { PROPERTY_TYPES, STATUS_LABELS, TYPE_LABELS } from "@/lib/constants";
import { formatNumber, formatPrice } from "@/lib/format";
import type { Property, PropertyStatus } from "@/lib/types";

export const Route = createFileRoute("/properties")({
  head: () => ({
    meta: [
      { title: "خريطة العقارات — عقار درايف" },
      {
        name: "description",
        content: "تصفح عقارات المملكة على خريطة تفاعلية بإحداثيات حقيقية مع فلترة حسب السعر والحالة.",
      },
      { property: "og:title", content: "خريطة العقارات — عقار درايف" },
      {
        property: "og:description",
        content: "خريطة تفاعلية لعقارات السوق السعودي مع بحث وفلترة مباشرة.",
      },
    ],
  }),
  component: PropertiesPage,
});

const MAX_PRICE = 5000000;

function PropertiesPage() {
  const { data: properties = [], isLoading } = usePublicProperties();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | PropertyStatus>("all");
  const [type, setType] = useState("all");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [selected, setSelected] = useState<Property | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim();
    return properties.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (type !== "all" && p.property_type !== type) return false;
      if (p.price > maxPrice) return false;
      if (q && !`${p.name} ${p.district} ${p.city}`.includes(q)) return false;
      return true;
    });
  }, [properties, search, status, type, maxPrice]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">خريطة العقارات</h1>
          <p className="text-sm text-muted-foreground">
            {formatNumber(filtered.length)} عقار مطابق للبحث
          </p>
        </div>
        {user ? (
          <AddPropertyDialog />
        ) : (
          <Button asChild size="sm">
            <Link to="/auth">سجّل الدخول لإضافة عقارك</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* Sidebar */}
        <aside className="flex max-h-[78vh] flex-col overflow-hidden rounded-xl border border-border bg-surface">
          <div className="space-y-3 border-b border-border p-4">
            <div className="relative">
              <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم العقار أو الحي أو المدينة"
                className="pr-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  {(Object.keys(STATUS_LABELS) as PropertyStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأنواع</SelectItem>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>أعلى سعر</span>
                <span className="text-gold">{formatPrice(maxPrice)} ريال</span>
              </div>
              <Slider
                value={[maxPrice]}
                min={100000}
                max={MAX_PRICE}
                step={50000}
                onValueChange={(v) => setMaxPrice(v[0] ?? MAX_PRICE)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && <p className="p-4 text-sm text-muted-foreground">جارٍ التحميل…</p>}
            {!isLoading && filtered.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">لا توجد عقارات مطابقة.</p>
            )}
            {filtered.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                active={selected?.id === p.id}
                onSelect={setSelected}
              />
            ))}
          </div>
        </aside>

        {/* Map */}
        <div className="relative h-[78vh] overflow-hidden rounded-xl border border-border">
          <ClientMap
            properties={filtered}
            selectedId={selected?.id ?? null}
            focus={selected ? [selected.lat, selected.lng] : null}
            onSelect={setSelected}
          />

          {selected && (
            <div className="absolute bottom-4 left-4 z-[1000] w-[300px] rounded-xl border border-border bg-surface/95 p-4 backdrop-blur">
              {selected.images?.[0] && (
                <img
                  src={selected.images[0]}
                  alt={selected.name}
                  loading="lazy"
                  className="mb-3 h-32 w-full rounded-md object-cover"
                />
              )}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base">{selected.name}</h3>
                <StatusBadge status={selected.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected.district}، {selected.city} ·{" "}
                {TYPE_LABELS[selected.property_type] ?? "عقار"}
              </p>
              {selected.description && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {selected.description}
                </p>
              )}
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs">
                <div>
                  <p className="text-muted-foreground">الغرف</p>
                  <p className="text-foreground">{formatNumber(selected.beds)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">المساحة</p>
                  <p className="text-foreground">{formatNumber(selected.area)} م²</p>
                </div>
                <div>
                  <p className="text-muted-foreground">السعر</p>
                  <p className="text-gold">{formatPrice(selected.price)}</p>
                </div>
              </div>
              <div className="mt-3">
                {user ? (
                  <RequestDialog property={selected} />
                ) : (
                  <Button asChild size="sm" className="w-full">
                    <Link to="/auth">سجّل الدخول لطلب معاينة</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
