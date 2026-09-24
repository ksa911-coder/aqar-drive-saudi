export type PropertyStatus = "available" | "reserved" | "sold";
export type RequestStatus = "new" | "in_progress" | "done";

export interface Property {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  district: string;
  city: string;
  property_type: string;
  price: number;
  beds: number;
  area: number;
  status: PropertyStatus;
  lat: number;
  lng: number;
  images: string[];
  approved: boolean;
  sold_at: string | null;
  created_at: string;
  // الحقول المضافة لحل مشكلة أخطاء الخريطة:
  plot_number?: string | null;
  street_name?: string | null;
  street_width?: number | null;
}

export interface PropertyRequest {
  id: string;
  property_id: string | null;
  client_id: string | null;
  message: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  status: RequestStatus;
  created_at: string;
}