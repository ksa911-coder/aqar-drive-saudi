import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { ComponentProps } from "react";

const PropertyMap = lazy(() => import("./PropertyMap"));

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
  return (
    <ClientOnly fallback={<MapFallback className={props.className} />}>
      <Suspense fallback={<MapFallback className={props.className} />}>
        <PropertyMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}
