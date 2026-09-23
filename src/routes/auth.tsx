import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — عقار درايف" },
      { name: "description", content: "سجّل دخولك إلى عقار درايف لإضافة عقارك ومتابعة طلباتك." },
      { property: "og:title", content: "تسجيل الدخول — عقار درايف" },
      { property: "og:description", content: "حساب واحد لإدارة عقاراتك وطلباتك داخل المنصة." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/properties", replace: true });
  }, [user, navigate]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: String(form.get("full_name") ?? "") },
        },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("تم إنشاء الحساب. تفقد بريدك لتأكيد التسجيل.");
      setMode("signin");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("بيانات الدخول غير صحيحة");
      return;
    }
    navigate({ to: "/properties" });
  };

  const googleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("تعذر تسجيل الدخول عبر جوجل");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/properties" });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20">
      <Logo size={48} />
      <h1 className="mt-5 font-display text-2xl">
        {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
      </h1>
      <p className="mt-1.5 text-center text-sm text-muted-foreground">
        حساب واحد لإضافة عقاراتك ومتابعة طلبات المعاينة.
      </p>

      <form onSubmit={onSubmit} className="mt-8 w-full space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="full_name">الاسم الكامل</Label>
            <Input id="full_name" name="full_name" required />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" type="email" required dir="ltr" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input id="password" name="password" type="password" required minLength={6} dir="ltr" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "جارٍ المعالجة…" : mode === "signin" ? "دخول" : "إنشاء الحساب"}
        </Button>
      </form>

      <div className="my-6 flex w-full items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> أو <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="w-full" onClick={googleSignIn}>
        المتابعة باستخدام جوجل
      </Button>

      <button
        className="mt-6 text-sm text-muted-foreground hover:text-gold"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "ليس لديك حساب؟ أنشئ حسابًا" : "لديك حساب؟ سجّل الدخول"}
      </button>
    </div>
  );
}
