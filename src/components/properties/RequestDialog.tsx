import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Property } from "@/lib/types";

export function RequestDialog({ property }: { property: Property }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    setSaving(true);
    const { error } = await supabase.from("requests").insert({
      property_id: property.id,
      client_id: user.id,
      contact_name: String(form.get("contact_name") ?? ""),
      contact_phone: String(form.get("contact_phone") ?? ""),
      message: String(form.get("message") ?? ""),
    });
    setSaving(false);
    if (error) {
      toast.error("تعذر إرسال الطلب");
      return;
    }
    toast.success("تم إرسال طلبك، وسيتواصل معك فريقنا قريبًا.");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          طلب معاينة
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="font-display">طلب معاينة — {property.name}</DialogTitle>
          <DialogDescription>اترك بياناتك وسيتواصل معك فريق عقار درايف.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="contact_name">الاسم</Label>
            <Input id="contact_name" name="contact_name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_phone">رقم الجوال</Label>
            <Input id="contact_phone" name="contact_phone" required placeholder="05xxxxxxxx" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">رسالتك</Label>
            <Textarea id="message" name="message" rows={3} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "جارٍ الإرسال…" : "إرسال الطلب"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
