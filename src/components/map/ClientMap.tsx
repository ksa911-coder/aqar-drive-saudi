import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import PropertyMap from "./PropertyMap";

type MapProps = ComponentProps<typeof PropertyMap>;

function MapFallback({ className }: { className?: string | undefined }) {
  return (
    <div
      className={
        className ??
        "flex h-full w-full items-center justify-center bg-surface text-sm text-muted-foreground"
      }
    >
      جارٍ تحميل الخريطة…
    </div>
  );
}

export function ClientMap(props: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <MapFallback className={props.className} />;
  }

  return <PropertyMap {...props} />;
}