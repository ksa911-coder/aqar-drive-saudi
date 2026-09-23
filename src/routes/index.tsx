import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileSignature, Headphones, MonitorPlay } from "lucide-react";
import heroVilla from "@/assets/hero-villa.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "عقار درايف — مكتب عقاري سحابي بلا فروع" },
      {
        name: "description",
        content:
          "عقار درايف منصة عقارية سعودية تتيح تصفح العقارات على الخريطة، المعاينة عن بُعد، وإتمام العقد إلكترونيًا.",
      },
      { property: "og:title", content: "عقار درايف — مكتب عقاري سحابي بلا فروع" },
      {
        property: "og:description",
        content: "تصفح العقارات على الخريطة، عاين عن بُعد، وأنجز عقدك إلكترونيًا.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: MonitorPlay,
    title: "معاينة رقمية",
    body: "جولة مصورة ومكالمة مباشرة مع مختص لتعاين العقار من مكانك، دون تنقل ولا مواعيد.",
  },
  {
    icon: FileSignature,
    title: "تعاقد إلكتروني",
    body: "توثيق العرض وإصدار العقد إلكترونيًا بخطوات واضحة ومسار موثّق من البداية للنهاية.",
  },
  {
    icon: Headphones,
    title: "دعم متواصل",
    body: "فريق متاح على مدار الساعة لمتابعة طلبك والرد على استفساراتك في كل مرحلة.",
  },
];

const steps = [
  { n: "٠١", title: "ابحث", body: "تصفح العقارات على الخريطة وفلترها حسب السعر والحي والحالة." },
  { n: "٠٢", title: "عاين عن بُعد", body: "احجز جولة رقمية مع مختص يجيب على أسئلتك مباشرة." },
  { n: "٠٣", title: "وثّق العرض", body: "قدّم عرضك وتابع الرد وحالة التفاوض داخل المنصة." },
  { n: "٠٤", title: "أنجز العقد", body: "وقّع إلكترونيًا واستلم نسختك الموثقة فور الاعتماد." },
];

function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1 text-xs text-gold">
              مكتب عقاري سحابي · السوق السعودي
            </span>
            <h1 className="font-display text-4xl leading-[1.2] font-black sm:text-5xl lg:text-6xl">
              بلا فروع، بلا انتظار.
              <span className="block text-gold">عقارك يبدأ من شاشتك.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              عقار درايف يجمع البحث والمعاينة والتفاوض والتعاقد في مسار رقمي واحد، بإحداثيات حقيقية
              على الخريطة ومتابعة موثّقة لكل خطوة.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/properties">
                  تصفح العقارات <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">أنشئ حسابك</Link>
              </Button>
            </div>
            <dl className="grid max-w-md grid-cols-3 gap-6 border-t border-border/70 pt-6">
              {[
                ["٠", "فروع فعلية"],
                ["٢٤/٧", "دعم مباشر"],
                ["١٠٠٪", "مسار رقمي"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl text-gold">{v}</dt>
                  <dd className="text-xs text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border">
              <img
                src={heroVilla}
                alt="فيلا سكنية حديثة في المملكة العربية السعودية"
                width={1600}
                height={1104}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-2xl sm:text-3xl">لماذا عقار درايف</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="bg-background p-7">
              <f.icon className="size-6 text-gold" />
              <h3 className="mt-5 font-display text-lg">{f.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/70 bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-2xl sm:text-3xl">كيف تعمل المنصة</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="border-t border-gold/30 pt-5">
                <span className="font-display text-sm text-gold">{s.n}</span>
                <h3 className="mt-2 font-display text-lg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-gold/25 bg-surface p-10 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl">ابدأ رحلتك العقارية اليوم</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              أنشئ حسابك لتضيف عقارك أو تطلب معاينة رقمية خلال دقائق.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg">
              <Link to="/auth">إنشاء حساب</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/properties">تصفح الخريطة</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
