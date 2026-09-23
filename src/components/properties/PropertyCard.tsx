import { useState } from "react";
import { BedDouble, MapPin, Ruler, Heart } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { TYPE_LABELS } from "@/lib/constants";
import { formatNumber, formatPrice } from "@/lib/format";
import type { Property } from "@/lib/types";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  property: Property;
  active?: boolean;
  onSelect?: (p: Property) => void;
  isFavorite?: boolean;
}

export function PropertyCard({ property, active, onSelect, isFavorite: initialIsFavorite = false }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFav, setIsFav] = useState(initialIsFavorite);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("يجب تسجيل الدخول لإضافة العقار للمفضلة");

      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", property.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, property_id: property.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setIsFav(!isFav);
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(isFav ? "تم الإزالة من المفضلة" : "تمت الإضافة إلى المفضلة");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ ما");
    },
  });

  return (
    <div className={cn(
      "relative w-full border-b border-border/70 p-4 text-right transition-colors hover:bg-surface-2/60",
      active && "bg-surface-2/80",
    )}>
      <button
        type="button"
        onClick={() => onSelect?.(property)}
        className="w-full text-right"
      >
        <div className="flex gap-3">
          {property.images?.[0] ? (
            <img
              src={property.images[0]}
              alt={property.name}
              loading="lazy"
              className="size-20 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-[10px] text-muted-foreground">
              {TYPE_LABELS[property.property_type] ?? "عقار"}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate font-display text-sm font-bold">{property.name}</h3>
              <StatusBadge status={property.status} />
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {property.district}، {property.city}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {property.beds > 0 && (
                <span className="flex items-center gap-1">
                  <BedDouble className="size-3" /> {formatNumber(property.beds)} غرف
                </span>
              )}
              <span className="flex items-center gap-1">
                <Ruler className="size-3" /> {formatNumber(property.area)} م²
              </span>
            </div>
            <p className="font-display text-sm text-gold">{formatPrice(property.price)} ريال</p>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavoriteMutation.mutate();
        }}
        className="absolute left-4 top-4 rounded-full bg-background/80 p-1.5 shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
        title="إضافة للمفضلة"
      >
        <Heart className={`size-4 ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
      </button>
    </div>
  );
}