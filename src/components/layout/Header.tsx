import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoLockup } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/properties", label: "العقارات" },
] as const;

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="shrink-0">
          <LogoLockup />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <Link
              to="/my-properties"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-gold" }}
            >
              عقاراتي
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-gold" }}
            >
              لوحة التحكم
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="max-w-[160px] truncate text-xs text-muted-foreground">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">تسجيل الدخول</Link>
            </Button>
          )}
        </div>

        <button
          className="rounded-md border border-border p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-surface px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user && (
              <Link to="/my-properties" className="text-sm" onClick={() => setOpen(false)}>
                عقاراتي
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-sm" onClick={() => setOpen(false)}>
                لوحة التحكم
              </Link>
            )}
            {user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                تسجيل الخروج
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth" onClick={() => setOpen(false)}>
                  تسجيل الدخول
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
