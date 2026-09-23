import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { AddPropertyDialog } from "@/components/properties/AddPropertyDialog";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { Property } from "@/lib/types";

export const Route = createFileRoute("/my_properties")({
  component: MyPropertiesPage,
});

function MyPropertiesPage() {
  const { user } = useAuth();

  // جلب العقارات الخاصة بالمستخدم الحالي فقط بناءً على owner_id
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["my-properties", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">عقاراتي</h1>
          <p className="text-sm text-muted-foreground">
            إدارة ومتابعة العقارات التي قمتم بإضافتها ({formatNumber(properties.length)})
          </p>
        </div>
        <AddPropertyDialog />
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">جارٍ تحميل عقاراتك…</p>
      )}

      {!isLoading && properties.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
          <Building2 className="mb-3 size-12 text-muted-foreground/50" />
          <h3 className="font-display text-lg font-medium">ليس لديك أي عقارات مضافة بعد</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            ابدأ بإضافة عقارك الأول ليظهر في المنصة ويسهل الوصول إليه.
          </p>
          <AddPropertyDialog />
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