-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads', 
  'uploads', 
  false, 
  20971520, -- 20MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'application/x-ofx', 'text/plain']
);

-- RLS policies for uploads bucket
CREATE POLICY "Users can upload files to own couple folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' 
  AND (storage.foldername(name))[1] = get_user_couple_id(auth.uid())::text
);

CREATE POLICY "Users can view own couple files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'uploads' 
  AND (storage.foldername(name))[1] = get_user_couple_id(auth.uid())::text
);

CREATE POLICY "Users can delete own couple files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'uploads' 
  AND (storage.foldername(name))[1] = get_user_couple_id(auth.uid())::text
);