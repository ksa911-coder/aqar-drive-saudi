import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { formatNumber } from "@/lib/format";
import type { Property } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("properties(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((item: any) => item.properties).filter(Boolean) as Property[];
    },
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">العقارات المفضلة</h1>
        <p className="text-sm text-muted-foreground">
          العقارات التي قمت بحفظها للمتابعة ({formatNumber(properties.length)})
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">جارٍ تحميل المفضلة...</p>
      )}

      {!isLoading && properties.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
          <Heart className="mb-3 size-12 text-muted-foreground/50" />
          <h3 className="font-display text-lg font-medium">ليس لديك عقارات في المفضلة بعد</h3>
          <p className="text-sm text-muted-foreground">
            تصفح العقارات واضغط على أيقونة القلب لحفظ ما يعجبك هنا.
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}