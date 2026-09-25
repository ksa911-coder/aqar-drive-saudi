import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import PropertyMap from "./PropertyMap";

type MapProps = ComponentProps<typeof PropertyMap>;

export function ClientMap(props: MapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-muted-foreground">
        جارٍ تهيئة الخريطة…
      </div>
    );
  }

  return <PropertyMap {...props} />;
}