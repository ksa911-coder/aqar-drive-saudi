import { Link } from "@tanstack/react-router";
import { LogoLockup } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <LogoLockup />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            مكتب عقاري سحابي يخدم السوق السعودي، بلا فروع وبلا انتظار.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-display text-sm text-foreground">روابط</h4>
          <Link to="/properties" className="block text-muted-foreground hover:text-gold">
            تصفح العقارات
          </Link>
          <Link to="/auth" className="block text-muted-foreground hover:text-gold">
            إنشاء حساب
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-display text-sm text-foreground">تواصل</h4>
          <p className="text-muted-foreground">الدعم متاح على مدار الساعة عبر المنصة.</p>
        </div>
      </div>
      <div className="border-t border-border/70 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} عقار درايف. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
