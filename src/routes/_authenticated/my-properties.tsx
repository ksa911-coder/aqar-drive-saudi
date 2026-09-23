import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AddPropertyDialog } from "@/components/properties/AddPropertyDialog";
import { StatusBadge } from "@/components/properties/StatusBadge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";
import { TYPE_LABELS } from "@/lib/constants";
import type { Property } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/my-properties")({
  head: () => ({
    meta: [
      { title: "عقاراتي — عقار درايف" },
      { name: "description", content: "تابع عقاراتك المضافة وحالة اعتمادها داخل عقار درايف." },
      { property: "og:title", content: "عقاراتي — عقار درايف" },
      { property: "og:description", content: "إدارة عقاراتك المضافة ومتابعة اعتمادها." },
    ],
  }),
  component: MyProperties,
});

function MyProperties() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["my-properties", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Property[]> => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Property[];
    },
  });

  const remove = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast.error("تعذر حذف العقار");
      return;
    }
    toast.success("تم حذف العقار");
    queryClient.invalidateQueries({ queryKey: ["my-properties", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["properties"] });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">عقاراتي</h1>
          <p className="text-sm text-muted-foreground">
            العقارات التي أضفتها وحالة اعتمادها للنشر.
          </p>
        </div>
        <AddPropertyDialog />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>}
      {!isLoading && data.length === 0 && (
        <p className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          لم تضف أي عقار بعد.
        </p>
      )}

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {data.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm">{p.name}</h3>
                <StatusBadge status={p.status} />
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] ${
                    p.approved
                      ? "border-available/40 bg-available/10 text-available"
                      : "border-reserved/40 bg-reserved/10 text-reserved"
                  }`}
                >
                  {p.approved ? "منشور" : "بانتظار الاعتماد"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {p.district}، {p.city} · {TYPE_LABELS[p.property_type] ?? "عقار"} ·{" "}
                {formatNumber(p.area)} م² · {formatDate(p.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display text-sm text-gold">{formatPrice(p.price)} ريال</span>
              <Button size="icon" variant="outline" onClick={() => remove(p.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
