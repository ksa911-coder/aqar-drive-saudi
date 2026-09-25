import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import PropertyMap from "./PropertyMap";

type MapProps = ComponentProps<typeof PropertyMap>;

export function ClientMap(props: MapProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-muted-foreground">
        جارٍ تهيئة الخريطة…
      </div>
    );
  }

  return <PropertyMap {...props} />;
}