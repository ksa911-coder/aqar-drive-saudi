import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowRight, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Property } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/edit-property")({
  component: EditPropertyPage,
});

function EditPropertyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // يمكنك استقبال المعرف عبر البارامترات أو الـ search params
  const searchParams = new URLSearchParams(window.location.search);
  const propertyId = searchParams.get("id");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [description, setDescription] = useState("");

  const { data: property, isLoading } = useQuery({
    queryKey: ["property-edit", propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();
      if (error) throw error;
      return data as Property;
    },
    enabled: !!propertyId,
  });

  useEffect(() => {
    if (property) {
      setName(property.name || "");
      setPrice(property.price?.toString() || "");
      setArea(property.area?.toString() || "");
      setCity(property.city || "");
      setDistrict(property.district || "");
      setDescription(property.description || "");
    }
  }, [property]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!propertyId) throw new Error("معرف العقار غير موجود");
      const { error } = await supabase
        .from("properties")
        .update({
          name,
          price: Number(price),
          area: Number(area),
          city,
          district,
          description,
        })
        .eq("id", propertyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      toast.success("تم تحديث العقار بنجاح");
      navigate({ to: "/my-properties" });
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء التحديث");
    },
  });

  if (isLoading) {
    return <p className="p-10 text-center text-sm text-muted-foreground">جارٍ تحميل بيانات العقار...</p>;
  }

  if (!propertyId) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-xl font-bold">عذراً</h1>
        <p className="mt-2 text-sm text-muted-foreground">لم يتم تحديد العقار المراد تعديله.</p>
        <Button onClick={() => navigate({ to: "/my-properties" })} className="mt-4">
          العودة لعقاراتي
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: "/my-properties" })} className="gap-2">
          <ArrowRight className="size-4" /> العودة لعقاراتي
        </Button>
        <h1 className="font-display text-xl font-bold">تعديل بيانات العقار</h1>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">اسم العقار</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: فيﻼ لؤلؤة الشرق" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">السعر (ريال)</label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">المساحة (م²)</label>
            <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">المدينة</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">الحي</label>
            <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">وصف العقار</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-border bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <Button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="w-full gap-2"
        >
          <Save className="size-4" /> {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
        </Button>
      </div>
    </div>
  );
}