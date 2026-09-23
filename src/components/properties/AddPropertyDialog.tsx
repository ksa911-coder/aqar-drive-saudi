import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import type { PropertyType } from "@/lib/types";

export function AddPropertyDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("villa");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("الرياض");
  const [district, setDistrict] = useState("");
  const [beds, setBeds] = useState("3");
  
  // الحقول الجديدة: رقم القطعة، اسم الشارع، وعرض الشارع
  const [plotNumber, setPlotNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [streetWidth, setStreetWidth] = useState("");

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [imagesInput, setImagesInput] = useState("");

  // دالة جلب إحداثيات الـ GPS من متصفح المستخدم
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("متصفحك لا يدعم خاصية تحديد الموقع الجغرافي GPS");
      return;
    }

    toast.loading("جارٍ تحديد موقعك الحالي...", { id: "gps-loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        toast.dismiss("gps-loading");
        toast.success("تم تحديث الإحداثيات بنجاح!");
      },
      (error) => {
        toast.dismiss("gps-loading");
        toast.error("تعذر تحديد الموقع. تأكد من السماح للمتصفح بالوصول لموقعك.");
        console.error(error);
      },
      { enableHighAccuracy: true }
    );
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("يجب تسجيل الدخول لإضافة عقار");
      
      const images = imagesInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase.from("properties").insert({
        user_id: user.id,
        name,
        property_type: propertyType,
        price: Number(price),
        area: Number(area),
        city,
        district,
        beds: Number(beds),
        plot_number: plotNumber || null,
        street_name: streetName || null,
        street_width: streetWidth ? Number(streetWidth) : null,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        description,
        images: images.length > 0 ? images : null,
        status: "available",
        approved: false,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      toast.success("تمت إضافة العقار بنجاح، وهو بانتظار اعتماد الإدارة");
      setOpen(false);
      // إعادة تعيين الحقول
      setName("");
      setPrice("");
      setArea("");
      setDistrict("");
      setPlotNumber("");
      setStreetName("");
      setStreetWidth("");
      setLat("");
      setLng("");
      setDescription("");
      setImagesInput("");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة العقار");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" /> إضافة عقار جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">إضافة عقار جديد للعرض</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">اسم العقار</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: فيلا عصرية في حي النرجس" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">نوع العقار</label>
              <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">السعر (ريال)</label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1500000" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">المساحة (م²)</label>
              <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="350" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">عدد الغرف</label>
              <Input type="number" value={beds} onChange={(e) => setBeds(e.target.value)} placeholder="4" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">المدينة</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">الحي</label>
            <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="حي الياسمين" />
          </div>

          {/* تفاصيل القطعة والشارع */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">رقم القطعة</label>
              <Input value={plotNumber} onChange={(e) => setPlotNumber(e.target.value)} placeholder="مثال: 123" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">اسم الشارع</label>
              <Input value={streetName} onChange={(e) => setStreetName(e.target.value)} placeholder="شارع الأمير سلطان" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">عرض الشارع (م)</label>
              <Input type="number" value={streetWidth} onChange={(e) => setStreetWidth(e.target.value)} placeholder="20" />
            </div>
          </div>

          {/* قسم إحداثيات الـ GPS */}
          <div className="rounded-lg border border-border bg-surface-2/50 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1 text-primary">
                <MapPin className="size-3.5" /> موقع العقار الجغرافي (GPS)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                className="h-8 gap-1.5 text-xs"
              >
                <Navigation className="size-3.5 text-gold" /> تحديد موقعي الحالي
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] text-muted-foreground">خط العرض (Latitude)</label>
                <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="24.7136" className="h-8 text-xs" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-muted-foreground">خط الطول (Longitude)</label>
                <Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="46.6753" className="h-8 text-xs" />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">روابط الصور (كل رابط في سطر)</label>
            <textarea
              value={imagesInput}
              onChange={(e) => setImagesInput(e.target.value)}
              rows={3}
              placeholder="https://example.com/image1.jpg"
              className="w-full rounded-md border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">وصف تفصيلي</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="اكتب تفاصيل إضافية عن العقار..."
              className="w-full rounded-md border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="w-full"
          >
            {createMutation.isPending ? "جارٍ الحفظ والنشر..." : "إضافة العقار"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}