-- Migration file for post-images storage bucket policies

-- Check and drop existing policies to avoid conflicts
DO $$
BEGIN
    -- Drop existing policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own post images') THEN
        DROP POLICY "Users can upload their own post images" ON storage.objects;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update/delete their own post images') THEN
        DROP POLICY "Users can update/delete their own post images" ON storage.objects;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view post images') THEN
        DROP POLICY "Anyone can view post images" ON storage.objects;
    END IF;
END
$$;

-- Create policies
CREATE POLICY "Users can upload their own post images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update/delete their own post images" 
ON storage.objects 
FOR UPDATE OR DELETE
TO authenticated 
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view post images" 
ON storage.objects 
FOR SELECT
TO public
USING (bucket_id = 'post-images');