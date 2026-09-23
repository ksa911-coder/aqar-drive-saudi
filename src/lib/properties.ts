import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Property, PropertyRequest } from "./types";

export const propertiesKey = ["properties"] as const;
export const allPropertiesKey = ["properties", "all"] as const;
export const requestsKey = ["requests"] as const;

export async function fetchPublicProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Property[];
}

export async function fetchAllProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Property[];
}

export function usePublicProperties() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: propertiesKey, queryFn: fetchPublicProperties });

  useEffect(() => {
    const channel = supabase
      .channel("properties-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, () => {
        queryClient.invalidateQueries({ queryKey: propertiesKey });
        queryClient.invalidateQueries({ queryKey: allPropertiesKey });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useAllProperties(enabled = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: allPropertiesKey,
    queryFn: fetchAllProperties,
    enabled,
  });

  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel("properties-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, () => {
        queryClient.invalidateQueries({ queryKey: allPropertiesKey });
        queryClient.invalidateQueries({ queryKey: propertiesKey });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, enabled]);

  return query;
}

export function useRequests(enabled = true) {
  return useQuery({
    queryKey: requestsKey,
    queryFn: async (): Promise<PropertyRequest[]> => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PropertyRequest[];
    },
    enabled,
  });
}

const FIVE_YEARS = 60 * 60 * 24 * 365 * 5;

export async function uploadPropertyImages(userId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("property-images").upload(path, file);
    if (error) throw error;
    const { data } = await supabase.storage
      .from("property-images")
      .createSignedUrl(path, FIVE_YEARS);
    if (data?.signedUrl) urls.push(data.signedUrl);
  }
  return urls;
}
