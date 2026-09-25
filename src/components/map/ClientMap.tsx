import { useEffect, useState, lazy, Suspense } from "react";
import type { ComponentProps } from "react";

type MapProps = ComponentProps<typeof import("./PropertyMap").default>;

// تحميل الخريطة بطريقة ديناميكية بحتة تتجاوز أي مشاكل في التجميد
const LazyPropertyMap = lazy(() => import("./PropertyMap"));

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

  return (
    <Suspense 
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-muted-foreground">
          جاري تحميل بيانات الخريطة…
        </div>
      }
    >
      <LazyPropertyMap {...props} />
    </Suspense>
  );
}