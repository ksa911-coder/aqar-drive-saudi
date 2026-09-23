
CREATE POLICY "property_images_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'property-images');
CREATE POLICY "property_images_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "property_images_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "property_images_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);
