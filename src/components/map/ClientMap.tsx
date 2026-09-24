import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import PropertyMap from "./PropertyMap";

type MapProps = ComponentProps<typeof PropertyMap>;

export function ClientMap(props: MapProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-muted-foreground">جارٍ تحميل الخريطة…</div>;
  return <PropertyMap {...props} />;
}