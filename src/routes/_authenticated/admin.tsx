import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Search, Trash2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/properties/StatusBadge";
import { AddPropertyDialog } from "@/components/properties/AddPropertyDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { allPropertiesKey, requestsKey, useAllProperties, useRequests } from "@/lib/properties";
import {
  REQUEST_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  TYPE_LABELS,
  PROPERTY_TYPES,
} from "@/lib/constants";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";
import type { Property, PropertyStatus, RequestStatus } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — عقار درايف" },
      { name: "description", content: "إدارة العقارات والطلبات ومؤشرات الأداء في عقار درايف." },
      { property: "og:title", content: "لوحة التحكم — عقار درايف" },
      { property: "og:description", content: "مؤشرات الأداء وإدارة العقارات والطلبات." },
    ],
  }),
  component: AdminPage,
});

const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const chartTooltip = {
  contentStyle: {
    background: "#FFFFFF",
    border: "1px solid #DED5C7",
    borderRadius: 8,
    fontFamily: "Tajawal, sans-serif",
    color: "#241F17",
  },
};

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const { data: properties = [] } = useAllProperties(isAdmin);
  const { data: requests = [] } = useRequests(isAdmin);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PropertyStatus>("all");

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: allPropertiesKey });
    queryClient.invalidateQueries({ queryKey: ["properties"] });
    queryClient.invalidateQueries({ queryKey: requestsKey });
  };

  const kpis = useMemo(() => {
    const sold = properties.filter((p) => p.status === "sold");
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return {
      total: properties.length,
      monthRequests: requests.filter((r) => new Date(r.created_at) >= monthStart).length,
      deals: sold.length,
      revenue: sold.reduce((sum, p) => sum + Number(p.price), 0),
    };
  }, [properties, requests]);

  const salesTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const total = properties
        .filter((p) => {
          const ref = p.sold_at ?? (p.status === "sold" ? p.created_at : null);
          if (!ref) return false;
          const rd = new Date(ref);
          return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
        })
        .reduce((sum, p) => sum + Number(p.price), 0);
      return { month: AR_MONTHS[d.getMonth()], total: Math.round(total / 1000) };
    });
  }, [properties]);

  const statusPie = useMemo(
    () =>
      (Object.keys(STATUS_LABELS) as PropertyStatus[]).map((s) => ({
        name: STATUS_LABELS[s],
        value: properties.filter((p) => p.status === s).length,
        color: STATUS_COLORS[s],
      })),
    [properties],
  );

  const byCity = useMemo(() => {
    const map = new Map<string, number>();
    properties
      .filter((p) => p.status === "sold")
      .forEach((p) => map.set(p.city, (map.get(p.city) ?? 0) + Number(p.price)));
    return [...map.entries()].map(([city, total]) => ({
      city,
      total: Math.round(total / 1000),
    }));
  }, [properties]);

  const byType = useMemo(
    () =>
      PROPERTY_TYPES.map((t) => ({
        type: t.label,
        count: properties.filter((p) => p.property_type === t.value).length,
      })).filter((r) => r.count > 0),
    [properties],
  );

  const filteredProps = useMemo(() => {
    const q = search.trim();
    return properties.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (q && !`${p.name} ${p.district} ${p.city}`.includes(q)) return false;
      return true;
    });
  }, [properties, search, statusFilter]);

  const approve = async (p: Property) => {
    const { error } = await supabase.from("properties").update({ approved: true }).eq("id", p.id);
    if (error) {
      toast.error("تعذر اعتماد العقار");
      return;
    }
    toast.success("تم اعتماد العقار ونشره");
    refresh();
  };

  const changeStatus = async (p: Property, status: PropertyStatus) => {
    const { error } = await supabase
      .from("properties")
      .update({ status, sold_at: status === "sold" ? new Date().toISOString() : null })
      .eq("id", p.id);
    if (error) {
      toast.error("تعذر تحديث الحالة");
      return;
    }
    refresh();
  };

  const removeProperty = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast.error("تعذر حذف العقار");
      return;
    }
    toast.success("تم حذف العقار");
    refresh();
  };

  const changeRequest = async (id: string, status: RequestStatus) => {
    const { error } = await supabase.from("requests").update({ status }).eq("id", id);
    if (error) {
      toast.error("تعذر تحديث الطلب");
      return;
    }
    refresh();
  };

  if (loading) {
    return <p className="p-10 text-center text-sm text-muted-foreground">جارٍ التحقق…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-xl">صلاحية غير كافية</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          لوحة التحكم متاحة لمديري المنصة فقط. تواصل مع الإدارة لمنحك صلاحية المدير.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">متابعة أداء المنصة وإدارة المحتوى.</p>
        </div>
        <AddPropertyDialog />
      </div>

      <Tabs defaultValue="overview" dir="rtl">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="properties">إدارة العقارات</TabsTrigger>
          <TabsTrigger value="requests">طلبات العملاء</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["إجمالي العقارات", formatNumber(kpis.total)],
              ["طلبات هذا الشهر", formatNumber(kpis.monthRequests)],
              ["صفقات مكتملة", formatNumber(kpis.deals)],
              ["إجمالي المبيعات", `${formatPrice(kpis.revenue)} ريال`],
            ].map(([label, value]) => (
              <div key={label} className="bg-background p-5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 font-display text-xl text-gold">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
              <h2 className="mb-4 font-display text-base">اتجاه المبيعات (بالألف ريال)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DED5C7" />
                    <XAxis dataKey="month" stroke="#756B5E" fontSize={12} />
                    <YAxis stroke="#756B5E" fontSize={12} />
                    <Tooltip {...chartTooltip} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="المبيعات"
                      stroke="#A9782E"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-4 font-display text-base">توزيع حالة العقارات</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {statusPie.map((s) => (
                        <Cell key={s.name} fill={s.color} stroke="#FFFFFF" />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 12, color: "#756B5E" }} />
                    <Tooltip {...chartTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Properties */}
        <TabsContent value="properties" className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن عقار"
                className="pr-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as never)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {(Object.keys(STATUS_LABELS) as PropertyStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">العقار</th>
                  <th className="p-3 font-medium">الموقع</th>
                  <th className="p-3 font-medium">السعر</th>
                  <th className="p-3 font-medium">الحالة</th>
                  <th className="p-3 font-medium">النشر</th>
                  <th className="p-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProps.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {TYPE_LABELS[p.property_type] ?? "عقار"} · {formatNumber(p.area)} م²
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {p.district}، {p.city}
                    </td>
                    <td className="p-3 text-gold">{formatPrice(p.price)}</td>
                    <td className="p-3">
                      <Select
                        value={p.status}
                        onValueChange={(v) => changeStatus(p, v as PropertyStatus)}
                      >
                        <SelectTrigger className="h-8 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(STATUS_LABELS) as PropertyStatus[]).map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      {p.approved ? (
                        <StatusBadge status="available" className="!text-available" />
                      ) : (
                        <span className="text-xs text-reserved">بانتظار الاعتماد</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {!p.approved && (
                          <Button size="icon" variant="outline" onClick={() => approve(p)}>
                            <Check className="size-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => removeProperty(p.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProps.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">لا توجد نتائج.</p>
            )}
          </div>
        </TabsContent>

        {/* Requests */}
        <TabsContent value="requests">
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[700px] text-right text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">العميل</th>
                  <th className="p-3 font-medium">العقار</th>
                  <th className="p-3 font-medium">الرسالة</th>
                  <th className="p-3 font-medium">التاريخ</th>
                  <th className="p-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((r) => {
                  const prop = properties.find((p) => p.id === r.property_id);
                  return (
                    <tr key={r.id}>
                      <td className="p-3">
                        <div>{r.contact_name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground" dir="ltr">
                          {r.contact_phone ?? ""}
                        </div>
                      </td>
                      <td className="p-3 text-xs">{prop?.name ?? "—"}</td>
                      <td className="max-w-[240px] p-3 text-xs text-muted-foreground">
                        {r.message || "—"}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="p-3">
                        <Select
                          value={r.status}
                          onValueChange={(v) => changeRequest(r.id, v as RequestStatus)}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(REQUEST_LABELS) as RequestStatus[]).map((s) => (
                              <SelectItem key={s} value={s}>
                                {REQUEST_LABELS[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {requests.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">لا توجد طلبات بعد.</p>
            )}
          </div>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 font-display text-base">المبيعات حسب المدينة (بالألف ريال)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DED5C7" />
                  <XAxis dataKey="city" stroke="#756B5E" fontSize={12} />
                  <YAxis stroke="#756B5E" fontSize={12} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="total" name="المبيعات" fill="#A9782E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 font-display text-base">توزيع العقارات حسب النوع</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DED5C7" />
                  <XAxis dataKey="type" stroke="#756B5E" fontSize={12} />
                  <YAxis stroke="#756B5E" fontSize={12} allowDecimals={false} />
                  <Tooltip {...chartTooltip} />
                  <Bar dataKey="count" name="عدد العقارات" fill="#D8B979" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
