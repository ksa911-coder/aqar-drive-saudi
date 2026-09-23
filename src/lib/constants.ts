import type { PropertyStatus, RequestStatus } from "./types";

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "متاح",
  reserved: "محجوز",
  sold: "مباع",
};

export const STATUS_COLORS: Record<PropertyStatus, string> = {
  available: "#5FB88A",
  reserved: "#E0A83E",
  sold: "#D9695F",
};

export const STATUS_CLASSES: Record<PropertyStatus, string> = {
  available: "text-available border-available/40 bg-available/10",
  reserved: "text-reserved border-reserved/40 bg-reserved/10",
  sold: "text-sold border-sold/40 bg-sold/10",
};

export const REQUEST_LABELS: Record<RequestStatus, string> = {
  new: "جديد",
  in_progress: "قيد المتابعة",
  done: "مكتمل",
};

export const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "duplex", label: "دوبلكس" },
  { value: "land", label: "أرض" },
  { value: "office", label: "مكتب" },
];

export const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPES.map((t) => [t.value, t.label]),
);

export const CITIES = [
  { name: "الرياض", lat: 24.7136, lng: 46.6753 },
  { name: "جدة", lat: 21.4858, lng: 39.1925 },
  { name: "الدمام", lat: 26.4207, lng: 50.0888 },
  { name: "مكة المكرمة", lat: 21.3891, lng: 39.8579 },
  { name: "المدينة المنورة", lat: 24.5247, lng: 39.5692 },
  { name: "الخبر", lat: 26.2794, lng: 50.208 },
  { name: "أبها", lat: 18.2465, lng: 42.5117 },
];

export const SAUDI_CENTER: [number, number] = [24.4539, 45.5];
